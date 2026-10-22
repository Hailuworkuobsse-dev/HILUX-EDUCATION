import { prisma } from '../../lib/prisma.js';
import type { TeacherOverviewDTO } from './types.js';

export async function getOverview(teacherId: string): Promise<TeacherOverviewDTO> {
  const [
    draftQuestions,
    reviewQuestions,
    publishedQuestions,
    draftPapers,
    publishedPapers,
    pendingReviews,
    flaggedQuestions
  ] = await Promise.all([
    prisma.question.count({ where: { createdById: teacherId, status: 'draft' } }),
    prisma.question.count({ where: { createdById: teacherId, status: 'review' } }),
    prisma.question.count({ where: { createdById: teacherId, status: 'published' } }),
    prisma.examPaper.count({ where: { createdById: teacherId, status: 'draft' } }),
    prisma.examPaper.count({ where: { createdById: teacherId, status: 'published' } }),
    prisma.question.count({
      where: { status: 'review', createdById: { not: teacherId } }
    }),
    prisma.contentFlag.count({
      where: {
        status: 'open',
        question: { createdById: teacherId }
      }
    })
  ]);

  return {
    draftQuestions,
    reviewQuestions,
    publishedQuestions,
    draftPapers,
    publishedPapers,
    pendingReviews,
    flaggedQuestions
  };
}
