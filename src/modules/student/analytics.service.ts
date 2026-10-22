import { prisma } from '../../lib/prisma.js';

const DAY_MS = 86_400_000;

export interface StudentOverviewDTO {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  overallAccuracy: number;
  questionsMastered: number;
  streakDays: number;
  dueReviewsCount: number;
  activeEnrollments: number;
}

export interface TopicAccuracyDTO {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface ProgressPointDTO {
  date: string;
  accuracy: number;
  questionsAnswered: number;
}

export interface DueReviewDTO {
  questionId: string;
  subjectId: string;
  topicId: string;
  prompt: string;
  dueAt: string;
}

export async function getOverview(userId: string): Promise<StudentOverviewDTO> {
  const attemptAgg = await prisma.$queryRaw<
    { attempts: bigint; avgScore: number | null }[]
  >`
    SELECT COUNT(*) AS attempts, AVG(score) AS avgScore
    FROM attempts
    WHERE userId = ${userId} AND status = 'graded'
  `;

  const answerAgg = await prisma.$queryRaw<
    { answered: bigint; correct: bigint }[]
  >`
    SELECT
      COUNT(*) AS answered,
      COALESCE(SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END), 0) AS correct
    FROM attempt_answers aa
    JOIN attempts att ON att.id = aa.attemptId
    WHERE att.userId = ${userId} AND aa.selectedOptionId IS NOT NULL
  `;

  const masteredAgg = await prisma.$queryRaw<{ mastered: bigint }[]>`
    SELECT COUNT(*) AS mastered FROM (
      SELECT aa.questionId
      FROM attempt_answers aa
      JOIN attempts att ON att.id = aa.attemptId
      WHERE att.userId = ${userId} AND aa.isCorrect = 1 AND att.status = 'graded'
      GROUP BY aa.questionId
      HAVING COUNT(*) >= 3
    ) AS m
  `;

  const dayRows = await prisma.$queryRaw<{ day: string }[]>`
    SELECT DISTINCT DATE_FORMAT(att.submittedAt, '%Y-%m-%d') AS day
    FROM attempts att
    WHERE att.userId = ${userId}
      AND att.status = 'graded'
      AND att.submittedAt IS NOT NULL
    ORDER BY day DESC
    LIMIT 100
  `;

  const dueReviewsCount = await prisma.reviewSchedule.count({
    where: { userId, dueAt: { lte: new Date() } }
  });

  const activeEnrollments = await prisma.enrollment.count({
    where: {
      userId,
      status: { in: ['trialing', 'active', 'grace_period'] }
    }
  });

  const totalAnswered = Number(answerAgg[0]?.answered ?? 0);
  const totalCorrect = Number(answerAgg[0]?.correct ?? 0);

  return {
    totalAttempts: Number(attemptAgg[0]?.attempts ?? 0),
    totalQuestionsAnswered: totalAnswered,
    averageScore: Number(attemptAgg[0]?.avgScore ?? 0),
    overallAccuracy: totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0,
    questionsMastered: Number(masteredAgg[0]?.mastered ?? 0),
    streakDays: computeStreak(dayRows.map((r) => String(r.day))),
    dueReviewsCount,
    activeEnrollments
  };
}

export async function getTopicAccuracy(userId: string): Promise<TopicAccuracyDTO[]> {
  const rows = await prisma.$queryRaw<
    {
      topicId: string;
      topicName: string;
      subjectId: string;
      subjectName: string;
      answered: bigint;
      correct: bigint;
    }[]
  >`
    SELECT
      t.id AS topicId,
      t.name AS topicName,
      s.id AS subjectId,
      s.name AS subjectName,
      COUNT(aa.id) AS answered,
      SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END) AS correct
    FROM attempt_answers aa
    JOIN attempts att ON att.id = aa.attemptId
    JOIN questions q ON q.id = aa.questionId
    JOIN topics t ON t.id = q.topicId
    JOIN subjects s ON s.id = q.subjectId
    WHERE att.userId = ${userId}
      AND att.status = 'graded'
      AND aa.selectedOptionId IS NOT NULL
    GROUP BY t.id, t.name, s.id, s.name
  `;

  return rows
    .map((r) => {
      const answered = Number(r.answered);
      const correct = Number(r.correct);
      return {
        topicId: String(r.topicId),
        topicName: String(r.topicName),
        subjectId: String(r.subjectId),
        subjectName: String(r.subjectName),
        answered,
        correct,
        accuracy: answered > 0 ? (correct / answered) * 100 : 0
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);
}

export async function getProgress(userId: string): Promise<ProgressPointDTO[]> {
  const rows = await prisma.$queryRaw<
    { date: string; accuracy: string | number; questionsAnswered: bigint }[]
  >`
    SELECT
      DATE_FORMAT(att.submittedAt, '%Y-%m-%d') AS date,
      (SUM(CASE WHEN aa.isCorrect = 1 THEN 1 ELSE 0 END) / COUNT(aa.id)) * 100 AS accuracy,
      COUNT(aa.id) AS questionsAnswered
    FROM attempts att
    JOIN attempt_answers aa ON aa.attemptId = att.id
    WHERE att.userId = ${userId}
      AND att.status = 'graded'
      AND att.submittedAt IS NOT NULL
      AND aa.selectedOptionId IS NOT NULL
      AND att.submittedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE_FORMAT(att.submittedAt, '%Y-%m-%d')
    ORDER BY date ASC
  `;

  return rows.map((r) => ({
    date: String(r.date),
    accuracy: Number(r.accuracy),
    questionsAnswered: Number(r.questionsAnswered)
  }));
}

export async function getDueReviews(userId: string): Promise<DueReviewDTO[]> {
  const schedules = await prisma.reviewSchedule.findMany({
    where: { userId, dueAt: { lte: new Date() } },
    orderBy: { dueAt: 'asc' },
    take: 200,
    include: {
      question: {
        select: {
          id: true,
          subjectId: true,
          topicId: true,
          prompt: true,
          status: true
        }
      }
    }
  });

  return schedules
    .filter((s) => s.question.status === 'published')
    .map((s) => ({
      questionId: s.question.id,
      subjectId: s.question.subjectId,
      topicId: s.question.topicId,
      prompt: s.question.prompt,
      dueAt: s.dueAt.toISOString()
    }));
}

function computeStreak(daysDesc: string[]): number {
  if (daysDesc.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);

  if (daysDesc[0] !== today && daysDesc[0] !== yesterday) return 0;

  let streak = 1;
  let prev = new Date(daysDesc[0]);
  for (let i = 1; i < daysDesc.length; i++) {
    const curr = new Date(daysDesc[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / DAY_MS);
    if (diff === 1) {
      streak++;
      prev = curr;
    } else {
      break;
    }
  }
  return streak;
}
