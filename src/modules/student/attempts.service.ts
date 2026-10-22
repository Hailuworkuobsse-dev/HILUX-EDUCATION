import type {
  Attempt,
  AttemptAnswer,
  AttemptMode,
  Question,
  QuestionOption
} from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { assertSubjectAccess } from './access.service.js';
import { gradeAttempt } from './grading.service.js';
import {
  toAttemptDTO,
  toAttemptResultDTO
} from './mappers.js';
import type { AttemptDTO, AttemptResultDTO } from './types.js';
import type {
  ListAttemptsQuery,
  StartAttemptInput
} from './attempts.schemas.js';

type QuestionWithOptions = Question & { options: QuestionOption[] };
type AnswerWithQuestion = AttemptAnswer & { question: QuestionWithOptions };
type AttemptWithAnswers = Attempt & { answers: AnswerWithQuestion[] };

async function createAttemptRecord(
  userId: string,
  data: {
    paperId: string | null;
    subjectId: string;
    title: string;
    mode: AttemptMode;
    durationMinutes: number | null;
    questions: QuestionWithOptions[];
  }
): Promise<AttemptWithAnswers> {
  const created = await prisma.attempt.create({
    data: {
      userId,
      paperId: data.paperId,
      subjectId: data.subjectId,
      title: data.title,
      mode: data.mode,
      durationMinutes: data.durationMinutes,
      totalQuestions: data.questions.length,
      status: 'in_progress',
      answers: {
        create: data.questions.map((q, i) => ({
          questionId: q.id,
          selectedOptionId: null,
          timeSpentMs: 0,
          orderIndex: i
        }))
      }
    },
    include: {
      answers: {
        orderBy: { orderIndex: 'asc' },
        include: {
          question: { include: { options: { orderBy: { orderIndex: 'asc' } } } }
        }
      }
    }
  });

  return created;
}

async function createPaperAttempt(
  userId: string,
  paperId: string
): Promise<AttemptWithAnswers> {
  const paper = await prisma.examPaper.findUnique({
    where: { id: paperId },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: {
          question: { include: { options: { orderBy: { orderIndex: 'asc' } } } }
        }
      }
    }
  });

  if (!paper) throw ApiError.notFound('Paper not found');
  if (paper.status !== 'published') {
    throw ApiError.badRequest('This paper is not published yet');
  }
  if (paper.questions.length === 0) {
    throw ApiError.badRequest('Paper has no questions');
  }

  await assertSubjectAccess(userId, paper.subjectId);

  return createAttemptRecord(userId, {
    paperId: paper.id,
    subjectId: paper.subjectId,
    title: paper.title,
    mode: 'paper',
    durationMinutes: paper.durationMinutes,
    questions: paper.questions.map((pq) => pq.question)
  });
}

async function createPracticeAttempt(
  userId: string,
  config: NonNullable<StartAttemptInput['practice']>
): Promise<AttemptWithAnswers> {
  await assertSubjectAccess(userId, config.subjectId);

  const subject = await prisma.subject.findUnique({
    where: { id: config.subjectId }
  });
  if (!subject) throw ApiError.notFound('Subject not found');

  let questions: QuestionWithOptions[];
  let mode: AttemptMode;
  let title: string;
  const durationMinutes: number | null = null;

  if (config.mode === 'spaced') {
    const schedules = await prisma.reviewSchedule.findMany({
      where: {
        userId,
        dueAt: { lte: new Date() },
        question: { subjectId: config.subjectId, status: 'published' }
      },
      include: {
        question: { include: { options: { orderBy: { orderIndex: 'asc' } } } }
      },
      orderBy: { dueAt: 'asc' },
      take: config.questionCount
    });

    questions = schedules.map((s) => s.question);
    mode = 'spaced';
    title = `Spaced review — ${subject.name}`;
  } else {
    const where: {
      subjectId: string;
      status: 'published';
      topicId?: { in: string[] };
    } = { subjectId: config.subjectId, status: 'published' };
    if (config.topicIds.length > 0) {
      where.topicId = { in: config.topicIds };
    }

    const pool = await prisma.question.findMany({
      where,
      include: { options: { orderBy: { orderIndex: 'asc' } } }
    });

    if (pool.length === 0) {
      throw ApiError.badRequest('No questions available for this selection');
    }

    const shuffled = shuffle(pool);
    questions = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
    mode = 'practice';
    title = `${subject.name} practice`;
  }

  if (questions.length === 0) {
    throw ApiError.badRequest(
      config.mode === 'spaced'
        ? 'No questions are due for review right now'
        : 'No questions available'
    );
  }

  return createAttemptRecord(userId, {
    paperId: null,
    subjectId: config.subjectId,
    title,
    mode,
    durationMinutes,
    questions
  });
}

export async function startAttempt(
  userId: string,
  payload: StartAttemptInput
): Promise<AttemptDTO> {
  let attempt: AttemptWithAnswers;

  if (payload.paperId) {
    attempt = await createPaperAttempt(userId, payload.paperId);
  } else {
    attempt = await createPracticeAttempt(userId, payload.practice!);
  }

  const subject = await prisma.subject.findUnique({
    where: { id: attempt.subjectId },
    select: { name: true }
  });

  return toAttemptDTO(attempt, {
    includeSolutions: false,
    subjectName: subject?.name ?? ''
  });
}

export async function getAttempt(
  userId: string,
  attemptId: string
): Promise<AttemptDTO> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        orderBy: { orderIndex: 'asc' },
        include: {
          question: { include: { options: { orderBy: { orderIndex: 'asc' } } } }
        }
      }
    }
  });
  if (!attempt) throw ApiError.notFound('Attempt not found');
  if (attempt.userId !== userId) throw ApiError.notFound('Attempt not found');

  const subject = await prisma.subject.findUnique({
    where: { id: attempt.subjectId },
    select: { name: true }
  });

  return toAttemptDTO(attempt, {
    includeSolutions: attempt.status === 'graded',
    subjectName: subject?.name ?? ''
  });
}

export async function listAttempts(
  userId: string,
  query: ListAttemptsQuery
): Promise<AttemptDTO[]> {
  const limit = query.limit ?? 20;
  const skip = ((query.page ?? 1) - 1) * limit;

  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {})
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip,
    include: {
      answers: {
        orderBy: { orderIndex: 'asc' },
        include: {
          question: { include: { options: { orderBy: { orderIndex: 'asc' } } } }
        }
      }
    }
  });

  const subjectIds = Array.from(new Set(attempts.map((a) => a.subjectId)));
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true, name: true }
  });
  const nameById = new Map(subjects.map((s) => [s.id, s.name]));

  return attempts.map((a) =>
    toAttemptDTO(a, {
      includeSolutions: a.status === 'graded',
      subjectName: nameById.get(a.subjectId) ?? ''
    })
  );
}

export async function saveAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  selectedOptionId: string | null
): Promise<{ message: string }> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, status: true }
  });
  if (!attempt) throw ApiError.notFound('Attempt not found');
  if (attempt.userId !== userId) throw ApiError.notFound('Attempt not found');
  if (attempt.status !== 'in_progress') {
    throw ApiError.badRequest('Attempt is no longer in progress');
  }

  const answer = await prisma.attemptAnswer.findUnique({
    where: { attemptId_questionId: { attemptId, questionId } }
  });
  if (!answer) throw ApiError.badRequest('Question is not part of this attempt');

  if (selectedOptionId !== null) {
    const option = await prisma.questionOption.findFirst({
      where: { id: selectedOptionId, questionId }
    });
    if (!option) throw ApiError.badRequest('Invalid answer option');
  }

  await prisma.attemptAnswer.update({
    where: { id: answer.id },
    data: { selectedOptionId }
  });

  return { message: 'Answer saved' };
}

export async function submitAttempt(
  userId: string,
  attemptId: string
): Promise<AttemptResultDTO> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, status: true }
  });
  if (!attempt) throw ApiError.notFound('Attempt not found');
  if (attempt.userId !== userId) throw ApiError.notFound('Attempt not found');

  if (attempt.status === 'graded') {
    return getAttemptResult(userId, attemptId);
  }
  if (attempt.status !== 'in_progress') {
    throw ApiError.badRequest('Attempt cannot be submitted in its current state');
  }

  await gradeAttempt(attemptId);
  return getAttemptResult(userId, attemptId);
}

export async function getAttemptResult(
  userId: string,
  attemptId: string
): Promise<AttemptResultDTO> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        orderBy: { orderIndex: 'asc' },
        include: {
          question: {
            include: {
              options: { orderBy: { orderIndex: 'asc' } },
              topic: true
            }
          }
        }
      }
    }
  });
  if (!attempt) throw ApiError.notFound('Attempt not found');
  if (attempt.userId !== userId) throw ApiError.notFound('Attempt not found');
  if (attempt.status !== 'graded') {
    throw ApiError.badRequest('Attempt is not graded yet');
  }

  const subject = await prisma.subject.findUnique({
    where: { id: attempt.subjectId },
    select: { name: true }
  });

  const result = toAttemptResultDTO(attempt, subject?.name ?? '');
  const topicIds = Array.from(new Set(attempt.answers.map((a) => a.question.topicId)));
  const topics = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
    select: { id: true, name: true }
  });
  const nameByTopic = new Map(topics.map((t) => [t.id, t.name]));

  return {
    ...result,
    breakdown: result.breakdown.map((b) => ({
      ...b,
      topicName: nameByTopic.get(b.topicId) ?? 'Topic'
    }))
  };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
