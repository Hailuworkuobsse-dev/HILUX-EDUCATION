import type { Prisma } from '@prisma/client';

type TxClient = Prisma.TransactionClient;

const DAY_MS = 86_400_000;

interface SM2State {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

function applySM2(state: SM2State, quality: number): SM2State {
  const easeFactor = Math.max(
    1.3,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let repetitions: number;
  let intervalDays: number;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions = state.repetitions + 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(state.intervalDays * easeFactor);
  }

  return { intervalDays, easeFactor, repetitions };
}

export async function updateSpacedScheduleTx(
  tx: TxClient,
  userId: string,
  questionId: string,
  isCorrect: boolean
): Promise<void> {
  const existing = await tx.reviewSchedule.findUnique({
    where: { userId_questionId: { userId, questionId } }
  });

  const quality = isCorrect ? 4 : 1;

  if (!existing) {
    const state = applySM2(
      { intervalDays: 1, easeFactor: 2.5, repetitions: 0 },
      quality
    );
    await tx.reviewSchedule.create({
      data: {
        userId,
        questionId,
        intervalDays: state.intervalDays,
        easeFactor: state.easeFactor,
        repetitions: state.repetitions,
        dueAt: new Date(Date.now() + state.intervalDays * DAY_MS),
        lastReviewedAt: new Date()
      }
    });
    return;
  }

  const state = applySM2(
    {
      intervalDays: existing.intervalDays,
      easeFactor: existing.easeFactor,
      repetitions: existing.repetitions
    },
    quality
  );

  await tx.reviewSchedule.update({
    where: { id: existing.id },
    data: {
      intervalDays: state.intervalDays,
      easeFactor: state.easeFactor,
      repetitions: state.repetitions,
      dueAt: new Date(Date.now() + state.intervalDays * DAY_MS),
      lastReviewedAt: new Date()
    }
  });
}
