import type { ID, ISODate } from './common';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type PaperStatus = 'draft' | 'review' | 'published' | 'archived';

/** Mirrors the backend `toSubjectDTO`. */
export interface Subject {
  id: ID;
  slug: string;
  name: string;
  iconKey: string;
  totalPapers: number;
  totalQuestions: number;
}

/** Mirrors the backend `toTopicDTO`. */
export interface Topic {
  id: ID;
  subjectId: ID;
  name: string;
}

/** Mirrors the backend `ExamPaperDTO`. */
export interface ExamPaper {
  id: ID;
  subjectId: ID;
  title: string;
  year: number;
  durationMinutes: number;
  totalQuestions: number;
  difficulty: Difficulty;
  status: PaperStatus;
  language: string;
  createdBy: ID;
  reviewedBy: ID | null;
  publishedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}
