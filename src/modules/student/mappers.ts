import type {
  Attempt,
  AttemptAnswer,
  ExamPaper,
  Question,
  QuestionOption,
  Subject,
  Topic
} from '@prisma/client';
import type {
  AttemptDTO,
  AttemptAnswerDTO,
  QuestionDTO,
  AttemptResultDTO
} from './types.js';

export interface SubjectCounts {
  totalPapers: number;
  totalQuestions: number;
}

export function toSubjectDTO(s: Subject, counts: SubjectCounts) {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    iconKey: s.iconKey ?? '',
    totalPapers: counts.totalPapers,
    totalQuestions: counts.totalQuestions
  };
}

export function toTopicDTO(t: Topic) {
  return { id: t.id, subjectId: t.subjectId, name: t.name };
}

export function toPaperDTO(p: ExamPaper, totalQuestions: number) {
  return {
    id: p.id,
    subjectId: p.subjectId,
    title: p.title,
    year: p.year,
    durationMinutes: p.durationMinutes,
    totalQuestions,
    difficulty: p.difficulty,
    status: p.status,
    language: p.language,
    createdBy: p.createdById,
    reviewedBy: p.reviewedById,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  };
}

type QuestionWithOptions = Question & { options: QuestionOption[] };

export interface QuestionMapperOptions {
  includeSolutions: boolean;
  paperIdOverride?: string | null;
}

export function toQuestionDTO(
  q: QuestionWithOptions,
  opts: QuestionMapperOptions
): QuestionDTO {
  return {
    id: q.id,
    subjectId: q.subjectId,
    topicId: q.topicId,
    paperId: opts.paperIdOverride ?? null,
    difficulty: q.difficulty,
    year: q.year,
    language: q.language,
    prompt: q.prompt,
    options: q.options.map((o) => ({ id: o.id, label: o.label, text: o.text })),
    correctOptionId: opts.includeSolutions ? q.correctOptionId : null,
    explanation: opts.includeSolutions ? q.explanation : null,
    status: q.status,
    createdBy: q.createdById,
    reviewedBy: q.reviewedById,
    version: q.version,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString()
  };
}

type AnswerWithQuestion = AttemptAnswer & { question: QuestionWithOptions };
type AttemptWithAnswers = Attempt & { answers: AnswerWithQuestion[] };

export interface AttemptMapperOptions {
  includeSolutions: boolean;
  subjectName: string;
}

export function toAttemptDTO(
  attempt: AttemptWithAnswers,
  opts: AttemptMapperOptions
): AttemptDTO {
  const answers: AttemptAnswerDTO[] = attempt.answers.map((a) => ({
    questionId: a.questionId,
    selectedOptionId: a.selectedOptionId,
    timeSpentMs: a.timeSpentMs,
    ...(opts.includeSolutions && a.isCorrect !== null
      ? { isCorrect: a.isCorrect }
      : {})
  }));

  const questions: QuestionDTO[] = attempt.answers.map((a) =>
    toQuestionDTO(a.question, {
      includeSolutions: opts.includeSolutions,
      paperIdOverride: attempt.paperId
    })
  );

  return {
    id: attempt.id,
    userId: attempt.userId,
    paperId: attempt.paperId,
    subjectId: attempt.subjectId,
    subjectName: opts.subjectName,
    title: attempt.title,
    mode: attempt.mode,
    status: attempt.status,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    durationMinutes: attempt.durationMinutes,
    totalQuestions: attempt.totalQuestions,
    questions,
    answers,
    score: attempt.score,
    correctCount: attempt.correctCount
  };
}

export function toAttemptResultDTO(
  attempt: AttemptWithAnswers,
  subjectName: string
): AttemptResultDTO {
  const dto = toAttemptDTO(attempt, { includeSolutions: true, subjectName });

  const questionsWithAnswers = attempt.answers.map((a) => ({
    ...toQuestionDTO(a.question, {
      includeSolutions: true,
      paperIdOverride: attempt.paperId
    }),
    selectedOptionId: a.selectedOptionId,
    isCorrect: a.isCorrect ?? false,
    timeSpentMs: a.timeSpentMs
  }));

  const grouped = new Map<
    string,
    { topicId: string; topicName: string; correct: number; total: number }
  >();

  for (const a of attempt.answers) {
    const key = a.question.topicId;
    const entry =
      grouped.get(key) ?? {
        topicId: key,
        topicName: key,
        correct: 0,
        total: 0
      };
    entry.total += 1;
    if (a.isCorrect) entry.correct += 1;
    grouped.set(key, entry);
  }

  return {
    attempt: dto,
    questionsWithAnswers,
    breakdown: Array.from(grouped.values())
  };
}
