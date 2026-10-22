import { randomUUID } from 'node:crypto';
import type { QuestionOption } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { writeAudit } from '../../lib/audit.js';
import type { RequestContext } from '../../lib/http.js';
import { toQuestionDTO } from './mappers.js';
import type {
  PaginatedDTO,
  QuestionDTO,
  QuestionFormInput,
  QuestionStatus
} from './types.js';

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

interface ListQuestionsOptions {
  subjectId?: string;
  topicId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: QuestionStatus;
  search?: string;
  /** Defaults to 1 when omitted (the Zod schema also applies this default). */
  page?: number;
  /** Defaults to 20 when omitted (the Zod schema also applies this default). */
  pageSize?: number;
}

// ─── Option normalization ─────────────────────────────────────────────────

/**
 * The frontend always sends positional option ids (`opt-1`, `opt-2`, …).
 * We regenerate real IDs server-side to avoid cross-question collisions and
 * translate `correctOptionId` to the corresponding new ID.
 */
function buildOptions(
  input: QuestionFormInput
): { options: Omit<QuestionOption, 'questionId'>[]; correctOptionId: string } {
  const correctIndex = input.options.findIndex((o) => o.id === input.correctOptionId);
  if (correctIndex < 0) {
    throw ApiError.badRequest('correctOptionId does not match any option');
  }

  const ids = input.options.map(() => randomUUID());
  const options = input.options.map((o, i) => ({
    id: ids[i],
    label: LABELS[i],
    text: o.text,
    orderIndex: i
  }));

  return { options, correctOptionId: ids[correctIndex] };
}

async function assertSubjectAndTopic(
  subjectId: string,
  topicId: string
): Promise<void> {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw ApiError.badRequest('Subject not found');

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw ApiError.badRequest('Topic not found');
  if (topic.subjectId !== subjectId) {
    throw ApiError.badRequest('Topic does not belong to the chosen subject');
  }
}

// ─── List ─────────────────────────────────────────────────────────────────

export async function listQuestions(
  opts: ListQuestionsOptions
): Promise<PaginatedDTO<QuestionDTO>> {
  const where: Record<string, unknown> = {};
  if (opts.subjectId) where.subjectId = opts.subjectId;
  if (opts.topicId) where.topicId = opts.topicId;
  if (opts.difficulty) where.difficulty = opts.difficulty;
  if (opts.status) where.status = opts.status;
  if (opts.search) where.prompt = { contains: opts.search };

  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      take: pageSize,
      skip,
      include: { options: { orderBy: { orderIndex: 'asc' } } }
    }),
    prisma.question.count({ where })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: items.map(toQuestionDTO),
    total,
    page,
    pageSize,
    totalPages
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────

export async function getQuestion(questionId: string): Promise<QuestionDTO> {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: { orderBy: { orderIndex: 'asc' } } }
  });
  if (!q) throw ApiError.notFound('Question not found');
  return toQuestionDTO(q);
}

// ─── Create ───────────────────────────────────────────────────────────────

export async function createQuestion(
  teacherId: string,
  input: QuestionFormInput,
  ctx: RequestContext
): Promise<QuestionDTO> {
  await assertSubjectAndTopic(input.subjectId, input.topicId);
  const { options, correctOptionId } = buildOptions(input);

  const created = await prisma.question.create({
    data: {
      subjectId: input.subjectId,
      topicId: input.topicId,
      difficulty: input.difficulty,
      year: input.year ?? null,
      language: input.language,
      prompt: input.prompt,
      explanation: input.explanation ?? null,
      correctOptionId,
      status: 'draft',
      createdById: teacherId,
      version: 1,
      options: { create: options }
    },
    include: { options: { orderBy: { orderIndex: 'asc' } } }
  });

  await writeAudit({
    actorId: teacherId,
    action: 'question.created',
    resourceType: 'question',
    resourceId: created.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return toQuestionDTO(created);
}

// ─── Update ───────────────────────────────────────────────────────────────

export async function updateQuestion(
  teacherId: string,
  questionId: string,
  input: QuestionFormInput,
  ctx: RequestContext
): Promise<QuestionDTO> {
  const existing = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, createdById: true, status: true, version: true }
  });
  if (!existing) throw ApiError.notFound('Question not found');
  if (existing.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can edit this question');
  }

  await assertSubjectAndTopic(input.subjectId, input.topicId);
  const { options, correctOptionId } = buildOptions(input);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.questionOption.deleteMany({ where: { questionId } });

    return tx.question.update({
      where: { id: questionId },
      data: {
        subjectId: input.subjectId,
        topicId: input.topicId,
        difficulty: input.difficulty,
        year: input.year ?? null,
        language: input.language,
        prompt: input.prompt,
        explanation: input.explanation ?? null,
        correctOptionId,
        status: 'draft',
        reviewedById: null,
        rejectionReason: null,
        publishedAt: null,
        version: { increment: 1 },
        options: { create: options }
      },
      include: { options: { orderBy: { orderIndex: 'asc' } } }
    });
  });

  await writeAudit({
    actorId: teacherId,
    action: 'question.updated',
    resourceType: 'question',
    resourceId: questionId,
    meta: { previousStatus: existing.status, version: updated.version },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return toQuestionDTO(updated);
}

// ─── Delete ───────────────────────────────────────────────────────────────

export async function deleteQuestion(
  teacherId: string,
  questionId: string,
  ctx: RequestContext
): Promise<void> {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, createdById: true, status: true }
  });
  if (!q) throw ApiError.notFound('Question not found');
  if (q.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can delete this question');
  }
  if (q.status !== 'draft') {
    throw ApiError.badRequest('Only draft questions can be deleted');
  }

  const attempts = await prisma.attemptAnswer.count({ where: { questionId } });
  if (attempts > 0) {
    throw ApiError.badRequest(
      'Cannot delete: this question has been attempted by students'
    );
  }

  await prisma.question.delete({ where: { id: questionId } });

  await writeAudit({
    actorId: teacherId,
    action: 'question.deleted',
    resourceType: 'question',
    resourceId: questionId,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);
}

// ─── Workflow ─────────────────────────────────────────────────────────────

export async function submitQuestionForReview(
  teacherId: string,
  questionId: string
): Promise<QuestionDTO> {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, createdById: true, status: true }
  });
  if (!q) throw ApiError.notFound('Question not found');
  if (q.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can submit this question for review');
  }
  if (q.status !== 'draft') {
    throw ApiError.badRequest('Only draft questions can be submitted for review');
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { status: 'review' },
    include: { options: { orderBy: { orderIndex: 'asc' } } }
  });
  return toQuestionDTO(updated);
}

export async function reviewQuestion(
  reviewerId: string,
  questionId: string,
  decision: 'approve' | 'reject',
  reason: string | undefined,
  ctx: RequestContext
): Promise<QuestionDTO> {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, createdById: true, status: true }
  });
  if (!q) throw ApiError.notFound('Question not found');
  if (q.status !== 'review') {
    throw ApiError.badRequest('Question is not currently in review');
  }
  if (q.createdById === reviewerId) {
    throw ApiError.forbidden('You cannot review your own submission');
  }

  if (decision === 'approve') {
    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        status: 'published',
        reviewedById: reviewerId,
        publishedAt: new Date(),
        rejectionReason: null
      },
      include: { options: { orderBy: { orderIndex: 'asc' } } }
    });

    await writeAudit({
      actorId: reviewerId,
      action: 'question.published',
      resourceType: 'question',
      resourceId: questionId,
      ip: ctx.ip,
      userAgent: ctx.userAgent
    }).catch(() => undefined);

    return toQuestionDTO(updated);
  }

  // Reject → draft
  if (!reason || reason.trim().length < 10) {
    throw ApiError.badRequest('Rejecting requires a reason (min 10 chars)');
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      status: 'draft',
      reviewedById: reviewerId,
      rejectionReason: reason,
      publishedAt: null
    },
    include: { options: { orderBy: { orderIndex: 'asc' } } }
  });

  await writeAudit({
    actorId: reviewerId,
    action: 'question.rejected',
    resourceType: 'question',
    resourceId: questionId,
    meta: { reason },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return toQuestionDTO(updated);
}

export async function archiveQuestion(
  teacherId: string,
  questionId: string
): Promise<QuestionDTO> {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, createdById: true, status: true }
  });
  if (!q) throw ApiError.notFound('Question not found');
  if (q.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can archive this question');
  }
  if (q.status !== 'published') {
    throw ApiError.badRequest('Only published questions can be archived');
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { status: 'archived', archivedAt: new Date() },
    include: { options: { orderBy: { orderIndex: 'asc' } } }
  });
  return toQuestionDTO(updated);
}
