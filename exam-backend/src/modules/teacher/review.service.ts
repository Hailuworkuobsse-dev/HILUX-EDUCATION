import { prisma } from '../../lib/prisma.js';
import { toPaperDTO, toQuestionDTO } from './mappers.js';
import type { ExamPaperDTO, QuestionDTO } from './types.js';

export async function getReviewQueueQuestions(
  teacherId: string
): Promise<QuestionDTO[]> {
  const questions = await prisma.question.findMany({
    where: {
      status: 'review',
      createdById: { not: teacherId }
    },
    orderBy: { updatedAt: 'asc' },
    include: { options: { orderBy: { orderIndex: 'asc' } } }
  });
  return questions.map(toQuestionDTO);
}

export async function getReviewQueuePapers(
  teacherId: string
): Promise<ExamPaperDTO[]> {
  const papers = await prisma.examPaper.findMany({
    where: {
      status: 'review',
      createdById: { not: teacherId }
    },
    orderBy: { updatedAt: 'asc' },
    include: { _count: { select: { questions: true } } }
  });
  return papers.map((p) => toPaperDTO(p, p._count.questions));
}
