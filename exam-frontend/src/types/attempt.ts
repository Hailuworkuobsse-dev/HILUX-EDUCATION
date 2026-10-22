import type { ID, ISODate } from './common';
import type { Question } from './question';

export type AttemptMode = 'paper' | 'practice' | 'spaced';
export type AttemptStatus = 'in_progress' | 'submitted' | 'graded' | 'abandoned';

export interface AttemptAnswer {
  questionId: ID;
  selectedOptionId: ID | null;
  timeSpentMs: number;
  isCorrect?: boolean;
}

export interface TopicBreakdown {
  topicId: ID;
  topicName: string;
  correct: number;
  total: number;
}

export interface Attempt {
  id: ID;
  userId: ID;
  paperId: ID | null;
  subjectId: ID;
  subjectName: string;
  title: string;
  mode: AttemptMode;
  status: AttemptStatus;
  startedAt: ISODate;
  submittedAt: ISODate | null;
  durationMinutes: number | null;
  totalQuestions: number;
  questions: Question[];
  answers: AttemptAnswer[];
  score: number | null;
  correctCount: number | null;
}

export interface QuestionWithAnswer extends Question {
  selectedOptionId: ID | null;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface AttemptResult {
  attempt: Attempt;
  questionsWithAnswers: QuestionWithAnswer[];
  breakdown: TopicBreakdown[];
}
