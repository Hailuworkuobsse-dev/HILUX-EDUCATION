import type {
  ExamPaper,
  Question,
  QuestionOption,
  Topic
} from '@prisma/client';
import type {
  ExamPaperDTO,
  QuestionDTO,
  TopicDTO
} from './types.js';

type QuestionWithOptions = Question & { options: QuestionOption[] };

export function toPaperDTO(p: ExamPaper, totalQuestions: number): ExamPaperDTO {
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

export function toQuestionDTO(q: QuestionWithOptions): QuestionDTO {
  return {
    id: q.id,
    subjectId: q.subjectId,
    topicId: q.topicId,
    paperId: null,
    difficulty: q.difficulty,
    year: q.year,
    language: q.language,
    prompt: q.prompt,
    options: q.options
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((o) => ({ id: o.id, label: o.label as QuestionDTO['options'][number]['label'], text: o.text })),
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
    status: q.status,
    createdBy: q.createdById,
    reviewedBy: q.reviewedById,
    version: q.version,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString()
  };
}

export function toTopicDTO(t: Topic): TopicDTO {
  return { id: t.id, subjectId: t.subjectId, name: t.name };
}
