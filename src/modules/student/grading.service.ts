import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { updateSpacedScheduleTx } from './spaced.service.js';

export async function gradeAttempt(attemptId: string): Promise<void> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: { question: { select: { correctOptionId: true } } }
      }
    }
  });

  if (!attempt) throw ApiError.notFound('Attempt not found');
  if (attempt.status === 'graded') return;

  let correctCount = 0;
  const answerUpdates: { id: string; isCorrect: boolean }[] = [];
  const spacedOps: { questionId: string; isCorrect: boolean }[] = [];

  for (const a of attempt.answers) {
    const isCorrect =
      a.selectedOptionId !== null &&
      a.selectedOptionId === a.question.correctOptionId;
    if (isCorrect) correctCount += 1;
    answerUpdates.push({ id: a.id, isCorrect });
    spacedOps.push({ questionId: a.questionId, isCorrect });
  }

  const score =
    attempt.totalQuestions > 0
      ? (correctCount / attempt.totalQuestions) * 100
      : 0;

  await prisma.$transaction(async (tx) => {
    for (const upd of answerUpdates) {
      await tx.attemptAnswer.update({
        where: { id: upd.id },
        data: { isCorrect: upd.isCorrect }
      });
    }
    for (const op of spacedOps) {
      await updateSpacedScheduleTx(tx, attempt.userId, op.questionId, op.isCorrect);
    }
    await tx.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'graded',
        submittedAt: new Date(),
        score,
        correctCount
      }
    });
  });
}
