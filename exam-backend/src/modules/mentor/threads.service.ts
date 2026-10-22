import type { MentorThread, User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import {
  toMessageDTO,
  toThreadDTO
} from './mappers.js';
import { loadSubjectNames, loadUnreadCounts } from './mentees.service.js';
import type { MentorMessageDTO, MentorThreadDTO } from './types.js';

// ─── List all threads for a mentor ────────────────────────────────────────

export async function listThreads(mentorId: string): Promise<MentorThreadDTO[]> {
  const rows = await prisma.mentorThread.findMany({
    where: { mentorId },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      mentee: { select: { id: true, fullName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  const subjectIds = rows
    .map((t) => t.subjectId)
    .filter((id): id is string => id !== null);
  const nameById = await loadSubjectNames(subjectIds);

  const unreadByThread = await loadUnreadCounts(
    rows.map((t) => t.id),
    mentorId
  );

  return rows.map((t) =>
    toThreadDTO(
      t,
      t.subjectId ? nameById.get(t.subjectId) ?? null : null,
      unreadByThread.get(t.id) ?? 0
    )
  );
}

// ─── Get one thread ───────────────────────────────────────────────────────

export async function getThread(
  mentorId: string,
  threadId: string
): Promise<MentorThreadDTO> {
  const thread = await prisma.mentorThread.findUnique({
    where: { id: threadId },
    include: {
      mentee: { select: { id: true, fullName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });
  if (!thread || thread.mentorId !== mentorId) {
    throw ApiError.notFound('Thread not found');
  }

  let subjectName: string | null = null;
  if (thread.subjectId) {
    const s = await prisma.subject.findUnique({
      where: { id: thread.subjectId },
      select: { name: true }
    });
    subjectName = s?.name ?? null;
  }

  const unreadMap = await loadUnreadCounts([thread.id], mentorId);
  return toThreadDTO(thread, subjectName, unreadMap.get(thread.id) ?? 0);
}

// ─── Messages ─────────────────────────────────────────────────────────────

type ThreadAccess = Pick<MentorThread, 'id' | 'mentorId' | 'menteeId'>;

async function loadThreadOrFail(
  mentorId: string,
  threadId: string
): Promise<ThreadAccess> {
  const thread = await prisma.mentorThread.findUnique({
    where: { id: threadId },
    select: { id: true, mentorId: true, menteeId: true }
  });
  if (!thread || thread.mentorId !== mentorId) {
    throw ApiError.notFound('Thread not found');
  }
  return thread;
}

export async function listMessages(
  mentorId: string,
  threadId: string,
  since?: string
): Promise<MentorMessageDTO[]> {
  await loadThreadOrFail(mentorId, threadId);

  const messages = await prisma.mentorMessage.findMany({
    where: {
      threadId,
      ...(since ? { createdAt: { gt: new Date(since) } } : {})
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, fullName: true, role: true } }
    }
  });

  return messages.map(toMessageDTO);
}

export async function sendMessage(
  mentorId: string,
  threadId: string,
  body: string
): Promise<MentorMessageDTO> {
  await loadThreadOrFail(mentorId, threadId);

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.mentorMessage.create({
      data: { threadId, senderId: mentorId, body },
      include: { sender: { select: { id: true, fullName: true, role: true } } }
    });
    await tx.mentorThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() }
    });
    return created;
  });

  return toMessageDTO(message);
}

export async function markThreadRead(
  mentorId: string,
  threadId: string
): Promise<{ message: string }> {
  await loadThreadOrFail(mentorId, threadId);

  await prisma.mentorMessage.updateMany({
    where: {
      threadId,
      senderId: { not: mentorId },
      readAt: null
    },
    data: { readAt: new Date() }
  });

  return { message: 'Marked as read' };
}

export async function unreadThreadCount(mentorId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(DISTINCT mm.threadId) AS c
    FROM mentor_messages mm
    JOIN mentor_threads mt ON mt.id = mm.threadId
    WHERE mt.mentorId = ${mentorId}
      AND mm.senderId <> ${mentorId}
      AND mm.readAt IS NULL
  `;
  return Number(rows[0]?.c ?? 0);
}

// Silence unused type import
export type { User };
