import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { writeAudit } from '../../lib/audit.js';
import type { RequestContext } from '../../lib/http.js';
import { toPaperDTO, toQuestionDTO, toTopicDTO } from './mappers.js';
import type {
  ExamPaperDTO,
  PaperFormInput,
  PaperStatus,
  TeacherPaperDetailDTO
} from './types.js';

interface ListPapersOptions {
  subjectId?: string;
  status?: PaperStatus;
  search?: string;
}

// ─── List ─────────────────────────────────────────────────────────────────

export async function listPapers(opts: ListPapersOptions = {}): Promise<ExamPaperDTO[]> {
  const where: Record<string, unknown> = {};
  if (opts.subjectId) where.subjectId = opts.subjectId;
  if (opts.status) where.status = opts.status;
  if (opts.search) where.title = { contains: opts.search };

  const papers = await prisma.examPaper.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: { _count: { select: { questions: true } } }
  });

  return papers.map((p) => toPaperDTO(p, p._count.questions));
}

// ─── Detail ───────────────────────────────────────────────────────────────

export async function getPaper(paperId: string): Promise<TeacherPaperDetailDTO> {
  const paper = await prisma.examPaper.findUnique({
    where: { id: paperId },
    include: {
      _count: { select: { questions: true } },
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: {
          question: {
            include: { options: { orderBy: { orderIndex: 'asc' } } }
          }
        }
      }
    }
  });
  if (!paper) throw ApiError.notFound('Paper not found');

  const topics = await prisma.topic.findMany({
    where: { subjectId: paper.subjectId },
    orderBy: { name: 'asc' }
  });

  return {
    ...toPaperDTO(paper, paper._count.questions),
    questions: paper.questions.map((pq) => toQuestionDTO(pq.question)),
    topics: topics.map(toTopicDTO)
  };
}

// ─── Validation helpers ───────────────────────────────────────────────────

async function assertQuestionsArePublished(ids: string[]): Promise<void> {
  const unique = Array.from(new Set(ids));
  const questions = await prisma.question.findMany({
    where: { id: { in: unique } },
    select: { id: true, status: true }
  });

  const found = new Set(questions.map((q) => q.id));
  const missing = unique.filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw ApiError.badRequest(`Questions not found: ${missing.join(', ')}`);
  }

  const unpublished = questions.filter((q) => q.status !== 'published');
  if (unpublished.length > 0) {
    throw ApiError.badRequest(
      `All questions must be published before being added to a paper (${unpublished.length} not published)`
    );
  }
}

async function assertSubjectExists(subjectId: string): Promise<void> {
  const s = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!s) throw ApiError.badRequest('Subject not found');
}

// ─── Create ───────────────────────────────────────────────────────────────

export async function createPaper(
  teacherId: string,
  input: PaperFormInput,
  ctx: RequestContext
): Promise<ExamPaperDTO> {
  await assertSubjectExists(input.subjectId);
  await assertQuestionsArePublished(input.questionIds);

  const created = await prisma.examPaper.create({
    data: {
      subjectId: input.subjectId,
      title: input.title,
      year: input.year,
      durationMinutes: input.durationMinutes,
      difficulty: input.difficulty,
      language: input.language,
      description: input.description,
      status: 'draft',
      createdById: teacherId,
      questions: {
        create: input.questionIds.map((qid, i) => ({
          questionId: qid,
          orderIndex: i
        }))
      }
    },
    include: { _count: { select: { questions: true } } }
  });

  await writeAudit({
    actorId: teacherId,
    action: 'paper.created',
    resourceType: 'paper',
    resourceId: created.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return toPaperDTO(created, created._count.questions);
}

// ─── Update ───────────────────────────────────────────────────────────────

export async function updatePaper(
  teacherId: string,
  paperId: string,
  input: Partial<PaperFormInput>,
  ctx: RequestContext
): Promise<ExamPaperDTO> {
  const paper = await prisma.examPaper.findUnique({
    where: { id: paperId },
    select: { id: true, createdById: true, status: true }
  });
  if (!paper) throw ApiError.notFound('Paper not found');
  if (paper.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can edit this paper');
  }

  if (input.questionIds) {
    await assertQuestionsArePublished(input.questionIds);
  }
  if (input.subjectId) {
    await assertSubjectExists(input.subjectId);
  }

  const wasInReviewOrPublished =
    paper.status === 'review' || paper.status === 'published';

  const updated = await prisma.$transaction(async (tx) => {
    if (input.questionIds) {
      await tx.paperQuestion.deleteMany({ where: { paperId } });
      await tx.paperQuestion.createMany({
        data: input.questionIds.map((qid, i) => ({
          paperId,
          questionId: qid,
          orderIndex: i
        }))
      });
    }

    return tx.examPaper.update({
      where: { id: paperId },
      data: {
        title: input.title,
        subjectId: input.subjectId,
        year: input.year,
        durationMinutes: input.durationMinutes,
        difficulty: input.difficulty,
        language: input.language,
        description: input.description,
        // Editing a submitted/published paper returns it to draft.
        ...(wasInReviewOrPublished
          ? {
              status: 'draft',
              reviewedById: null,
              rejectionReason: null,
              publishedAt: null
            }
          : {})
      },
      include: { _count: { select: { questions: true } } }
    });
  });

  await writeAudit({
    actorId: teacherId,
    action: 'paper.updated',
    resourceType: 'paper',
    resourceId: paperId,
    meta: { returnedToDraft: wasInReviewOrPublished },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return toPaperDTO(updated, updated._count.questions);
}

// ─── Delete ───────────────────────────────────────────────────────────────

export async function deletePaper(
  teacherId: string,
  paperId: string,
  ctx: RequestContext
): Promise<void> {
  const paper = await prisma.examPaper.findUnique({
    where: { id: paperId },
    select: { id: true, createdById: true, status: true }
  });
  if (!paper) throw ApiError.notFound('Paper not found');
  if (paper.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can delete this paper');
  }
  if (paper.status !== 'draft') {
    throw ApiError.badRequest('Only draft papers can be deleted');
  }

  await prisma.examPaper.delete({ where: { id: paperId } });

  await writeAudit({
    actorId: teacherId,
    action: 'paper.deleted',
    resourceType: 'paper',
    resourceId: paperId,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);
}

// ─── Workflow ─────────────────────────────────────────────────────────────

export async function submitPaperForReview(
  teacherId: string,
  paperId: string
): Promise<ExamPaperDTO> {
  const paper = await prisma.examPaper.findUnique({
    where: { id: paperId },
    select: { id: true, createdById: true, status: true }
  });
  if (!paper) throw ApiError.notFound('Paper not found');
  if (paper.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can submit this paper for review');
  }
  if (paper.status !== 'draft') {
    throw ApiError.badRequest('Only draft papers can be submitted for review');
  }

  const unpublished = await prisma.paperQuestion.count({
    where: {
      paperId,
      question: { status: { not: 'published' } }
    }
  });
  if (unpublished > 0) {
    throw ApiError.badRequest(
      'All questions must be published before submitting the paper for review'
    );
  }

  const updated = await prisma.examPaper.update({
    where: { id: paperId },
    data: { status: 'review' },
    include: { _count: { select: { questions: true } } }
  });

  return toPaperDTO(updated, updated._count.questions);
}

async function loadForReview(
  teacherId: string,
  paperId: string
): Promise<{ id: string; createdById: string; status: PaperStatus }> {
  const paper = await prisma.examPaper.findUnique({
    where: { id: paperId },
    select: { id: true, createdById: true, status: true }
  });
  if (!paper) throw ApiError.notFound('Paper not found');
  if (paper.status !== 'review') {
    throw ApiError.badRequest('Paper is not currently in review');
  }
  if (paper.createdById === teacherId) {
    throw ApiError.forbidden('You cannot review your own submission');
  }
  return paper;
}

export async function approvePaper(
  reviewerId: string,
  paperId: string,
  ctx: RequestContext
): Promise<ExamPaperDTO> {
  await loadForReview(reviewerId, paperId);

  const updated = await prisma.examPaper.update({
    where: { id: paperId },
    data: {
      status: 'published',
      reviewedById: reviewerId,
      publishedAt: new Date(),
      rejectionReason: null
    },
    include: { _count: { select: { questions: true } } }
  });

  await writeAudit({
    actorId: reviewerId,
    action: 'paper.published',
    resourceType: 'paper',
    resourceId: paperId,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return toPaperDTO(updated, updated._count.questions);
}

export async function rejectPaper(
  reviewerId: string,
  paperId: string,
  reason: string,
  ctx: RequestContext
): Promise<ExamPaperDTO> {
  await loadForReview(reviewerId, paperId);

  const updated = await prisma.examPaper.update({
    where: { id: paperId },
    data: {
      status: 'draft',
      reviewedById: reviewerId,
      rejectionReason: reason,
      publishedAt: null
    },
    include: { _count: { select: { questions: true } } }
  });

  await writeAudit({
    actorId: reviewerId,
    action: 'paper.rejected',
    resourceType: 'paper',
    resourceId: paperId,
    meta: { reason },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return toPaperDTO(updated, updated._count.questions);
}

export async function archivePaper(
  teacherId: string,
  paperId: string
): Promise<ExamPaperDTO> {
  const paper = await prisma.examPaper.findUnique({
    where: { id: paperId },
    select: { id: true, createdById: true, status: true }
  });
  if (!paper) throw ApiError.notFound('Paper not found');
  if (paper.createdById !== teacherId) {
    throw ApiError.forbidden('Only the creator can archive this paper');
  }
  if (paper.status !== 'published') {
    throw ApiError.badRequest('Only published papers can be archived');
  }

  const updated = await prisma.examPaper.update({
    where: { id: paperId },
    data: { status: 'archived', archivedAt: new Date() },
    include: { _count: { select: { questions: true } } }
  });

  return toPaperDTO(updated, updated._count.questions);
}
