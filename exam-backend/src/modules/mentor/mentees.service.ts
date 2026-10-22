import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { toMenteeDTO, toThreadDTO, type MenteeRow } from './mappers.js';
import type { MenteeDetailDTO, MenteeDTO, MenteeRisk } from './types.js';

export interface ListMenteesOptions {
  search?: string;
  risk?: 'all' | MenteeRisk;
}

// ─── List ─────────────────────────────────────────────────────────────────

export async function listMentees(
  mentorId: string,
  opts: ListMenteesOptions = {}
): Promise<MenteeDTO[]> {
  const rows = await prisma.$queryRaw<MenteeRow[]>`
    SELECT
      ma.id           AS assignmentId,
      ma.menteeId     AS menteeId,
      ma.assignedAt   AS assignedAt,
      u.fullName      AS fullName,
      u.avatarUrl     AS avatarUrl,
      u.grade         AS grade,
      u.lastActiveAt  AS lastActiveAt,
      COUNT(DISTINCT att.id) AS attemptsCount,
      COUNT(aa.id) AS answered,
      COALESCE(SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END), 0) AS correct
    FROM mentee_assignments ma
    JOIN users u ON u.id = ma.menteeId
    LEFT JOIN attempts att ON att.userId = ma.menteeId AND att.status = 'graded'
    LEFT JOIN attempt_answers aa ON aa.attemptId = att.id AND aa.selectedOptionId IS NOT NULL
    WHERE ma.mentorId = ${mentorId} AND ma.endedAt IS NULL
    GROUP BY ma.id, ma.menteeId, ma.assignedAt, u.fullName, u.avatarUrl, u.grade, u.lastActiveAt
    ORDER BY ma.assignedAt DESC
  `;

  const menteeIds = rows.map((r) => r.menteeId);
  const subjectsByMentee = await loadSubjectsForMentees(menteeIds);

  let mentees = rows.map((r) =>
    toMenteeDTO(r, subjectsByMentee.get(r.menteeId) ?? [])
  );

  // Client-side filtering (risk is derived, not stored)
  if (opts.search && opts.search.trim()) {
    const q = opts.search.trim().toLowerCase();
    mentees = mentees.filter((m) => m.studentName.toLowerCase().includes(q));
  }
  if (opts.risk && opts.risk !== 'all') {
    mentees = mentees.filter((m) => m.riskLevel === opts.risk);
  }

  return mentees;
}

async function loadSubjectsForMentees(menteeIds: string[]): Promise<Map<string, string[]>> {
  if (menteeIds.length === 0) return new Map();
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: { in: menteeIds },
      status: { in: ['trialing', 'active', 'grace_period'] }
    },
    include: { subject: { select: { name: true } } },
    orderBy: { subject: { sortOrder: 'asc' } }
  });
  const map = new Map<string, string[]>();
  for (const e of enrollments) {
    const list = map.get(e.userId) ?? [];
    list.push(e.subject.name);
    map.set(e.userId, list);
  }
  return map;
}

// ─── Detail ───────────────────────────────────────────────────────────────

export async function getMentee(
  mentorId: string,
  menteeId: string
): Promise<MenteeDetailDTO> {
  const assignment = await prisma.menteeAssignment.findUnique({
    where: { menteeId_mentorId: { menteeId, mentorId } }
  });
  if (!assignment || assignment.endedAt) {
    throw ApiError.notFound('Mentee not found');
  }

  const rows = await prisma.$queryRaw<MenteeRow[]>`
    SELECT
      ma.id           AS assignmentId,
      ma.menteeId     AS menteeId,
      ma.assignedAt   AS assignedAt,
      u.fullName      AS fullName,
      u.avatarUrl     AS avatarUrl,
      u.grade         AS grade,
      u.lastActiveAt  AS lastActiveAt,
      COUNT(DISTINCT att.id) AS attemptsCount,
      COUNT(aa.id) AS answered,
      COALESCE(SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END), 0) AS correct
    FROM mentee_assignments ma
    JOIN users u ON u.id = ma.menteeId
    LEFT JOIN attempts att ON att.userId = ma.menteeId AND att.status = 'graded'
    LEFT JOIN attempt_answers aa ON aa.attemptId = att.id AND aa.selectedOptionId IS NOT NULL
    WHERE ma.mentorId = ${mentorId} AND ma.menteeId = ${menteeId} AND ma.endedAt IS NULL
    GROUP BY ma.id, ma.menteeId, ma.assignedAt, u.fullName, u.avatarUrl, u.grade, u.lastActiveAt
  `;

  const row = rows[0];
  if (!row) throw ApiError.notFound('Mentee not found');

  const subjectsByMentee = await loadSubjectsForMentees([menteeId]);
  const base = toMenteeDTO(row, subjectsByMentee.get(menteeId) ?? []);

  // Weak topics
  const weakRows = await prisma.$queryRaw<
    { topicId: string; topicName: string; answered: bigint; correct: bigint }[]
  >`
    SELECT
      t.id AS topicId,
      t.name AS topicName,
      COUNT(aa.id) AS answered,
      COALESCE(SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END), 0) AS correct
    FROM attempt_answers aa
    JOIN attempts att ON att.id = aa.attemptId
    JOIN questions q ON q.id = aa.questionId
    JOIN topics t ON t.id = q.topicId
    WHERE att.userId = ${menteeId}
      AND att.status = 'graded'
      AND aa.selectedOptionId IS NOT NULL
    GROUP BY t.id, t.name
    HAVING (COALESCE(SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END), 0) / COUNT(aa.id)) < 0.5
    ORDER BY (COALESCE(SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END), 0) / COUNT(aa.id)) ASC
    LIMIT 10
  `;

  const weakTopics = weakRows.map((r) => {
    const answered = Number(r.answered);
    const correct = Number(r.correct);
    return {
      topicId: String(r.topicId),
      topicName: String(r.topicName),
      accuracy: answered > 0 ? (correct / answered) * 100 : 0
    };
  });

  // Recent attempts
  const recentAttemptsRows = await prisma.attempt.findMany({
    where: { userId: menteeId },
    orderBy: { startedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      score: true,
      totalQuestions: true,
      submittedAt: true,
      status: true
    }
  });

  // Threads between this mentee and this mentor
  const threadRows = await prisma.mentorThread.findMany({
    where: { menteeId, mentorId },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      mentee: { select: { id: true, fullName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  const subjectIds = threadRows
    .map((t) => t.subjectId)
    .filter((id): id is string => id !== null);
  const subjectNameById = await loadSubjectNames(subjectIds);

  const threadIds = threadRows.map((t) => t.id);
  const unreadByThread = await loadUnreadCounts(threadIds, mentorId);

  const threads = threadRows.map((t) =>
    toThreadDTO(t, t.subjectId ? subjectNameById.get(t.subjectId) ?? null : null, unreadByThread.get(t.id) ?? 0)
  );

  return {
    ...base,
    weakTopics,
    recentAttempts: recentAttemptsRows.map((a) => ({
      id: a.id,
      title: a.title,
      score: a.score,
      totalQuestions: a.totalQuestions,
      submittedAt: a.submittedAt?.toISOString() ?? null,
      status: a.status
    })),
    threads
  };
}

export async function loadSubjectNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await prisma.subject.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true }
  });
  return new Map(rows.map((r) => [r.id, r.name]));
}

export async function loadUnreadCounts(
  threadIds: string[],
  mentorId: string
): Promise<Map<string, number>> {
  if (threadIds.length === 0) return new Map();
  const rows = await prisma.mentorMessage.groupBy({
    by: ['threadId'],
    where: {
      threadId: { in: threadIds },
      senderId: { not: mentorId },
      readAt: null
    },
    _count: { id: true }
  });
  return new Map(rows.map((r) => [r.threadId, r._count.id]));
}

// Silence unused-import warning for Prisma
void Prisma;
