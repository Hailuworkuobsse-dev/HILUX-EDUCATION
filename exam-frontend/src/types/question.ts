import type { ID, ISODate } from './common';
import type { Difficulty } from './exam';

export type QuestionStatus = 'draft' | 'review' | 'published' | 'archived';
export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QuestionOption {
  id: ID;
  label: OptionLabel | string;
  text: string;
}

/**
 * Mirrors the backend `QuestionDTO`.
 *
 * Note: option ids are positional (`opt-1`, `opt-2`, …) on the way *up* and
 * real database ids on the way *down* — the backend regenerates them on every
 * write, so never persist a client-generated id.
 */
export interface Question {
  id: ID;
  subjectId: ID;
  topicId: ID;
  paperId: ID | null;
  difficulty: Difficulty;
  year: number | null;
  language: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: ID | null;
  explanation: string | null;
  status: QuestionStatus;
  createdBy: ID;
  reviewedBy: ID | null;
  version: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}
