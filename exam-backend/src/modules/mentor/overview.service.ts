import { prisma } from '../../lib/prisma.js';
import { listMentees } from './mentees.service.js';
import { listThreads } from './threads.service.js';
import type { MentorOverviewDTO } from './types.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getOverview(mentorId: string): Promise<MentorOverviewDTO> {
  const [
    activeMentees,
    openReports,
    allMentees,
    allThreads
  ] = await Promise.all([
    prisma.menteeAssignment.count({
      where: { mentorId, endedAt: null }
    }),
    prisma.mentorReport.count({
      where: {
        status: 'open',
        OR: [{ mentorId }, { mentorId: null }]
      }
    }),
    listMentees(mentorId, {}),
    listThreads(mentorId)
  ]);

  const unreadThreads = allThreads.filter((t) => t.unreadCount > 0).length;
  const recentMentees = allMentees.slice(0, 4);
  const recentThreads = allThreads.slice(0, 4);

  // Response rate: fraction of student-active threads the mentor has replied to.
  const [threadsWithStudentMsg, threadsWithMentorMsg] = await Promise.all([
    prisma.mentorThread.count({
      where: {
        mentorId,
        messages: { some: { senderId: { not: mentorId } } }
      }
    }),
    prisma.mentorThread.count({
      where: {
        mentorId,
        messages: { some: { senderId: mentorId } }
      }
    })
  ]);
  const responseRate =
    threadsWithStudentMsg > 0
      ? Math.min(100, Math.round((threadsWithMentorMsg / threadsWithStudentMsg) * 100))
      : 0;

  // Mentees the mentor messaged in the last 7 days
  const since = new Date(Date.now() - WEEK_MS);
  const recentMessaged = await prisma.mentorMessage.findMany({
    where: {
      senderId: mentorId,
      createdAt: { gte: since },
      thread: { mentorId }
    },
    select: { thread: { select: { menteeId: true } } }
  });
  const menteesHelpedThisWeek = new Set(
    recentMessaged.map((m) => m.thread.menteeId)
  ).size;

  return {
    activeMentees,
    unreadThreads,
    openReports,
    responseRate,
    menteesHelpedThisWeek,
    recentMentees,
    recentThreads
  };
}
