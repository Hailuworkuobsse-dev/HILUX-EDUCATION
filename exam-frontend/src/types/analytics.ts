import type { ID, ISODate } from './common';

export interface StudentOverview {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  overallAccuracy: number;
  questionsMastered: number;
  streakDays: number;
  dueReviewsCount: number;
  activeEnrollments: number;
}

export interface TopicAccuracy {
  topicId: ID;
  topicName: string;
  subjectId: ID;
  subjectName: string;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface ProgressPoint {
  date: string;
  accuracy: number;
  questionsAnswered: number;
}

export interface DueReview {
  questionId: ID;
  subjectId: ID;
  topicId: ID;
  prompt: string;
  dueAt: ISODate;
}
