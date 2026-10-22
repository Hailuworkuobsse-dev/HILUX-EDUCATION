import type { ID, ISODate, Paginated } from './common';
import type { ExamPaper, Subject, Topic } from './exam';
import type { Question } from './question';

export type ReviewDecision = 'approve' | 'reject';

export interface TeacherOverview {
  draftQuestions: number;
  reviewQuestions: number;
  publishedQuestions: number;
  draftPapers: number;
  publishedPapers: number;
  pendingReviews: number;
  flaggedQuestions: number;
}

export interface QuestionFilter {
  subjectId?: string;
  topicId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'draft' | 'review' | 'published' | 'archived';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaperFilter {
  subjectId?: string;
  status?: 'draft' | 'review' | 'published' | 'archived';
  search?: string;
}

export interface TeacherPaperDetail extends ExamPaper {
  questions: Question[];
  topics: Topic[];
}

export interface QuestionFormPayload {
  subjectId: ID;
  topicId: ID;
  difficulty: 'easy' | 'medium' | 'hard';
  year?: number;
  language: string;
  prompt: string;
  options: { id: string; label: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
  correctOptionId: ID;
  explanation?: string;
}

export interface PaperFormPayload {
  title: string;
  subjectId: ID;
  year: number;
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  description?: string;
  questionIds: ID[];
}

export interface BulkImportRow {
  rowNumber: number;
  status: 'valid' | 'invalid';
  subjectName: string | null;
  prompt: string | null;
  errors: string[];
}

export interface BulkImportValidationResult {
  rows: BulkImportRow[];
  summary: { total: number; valid: number; invalid: number };
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
  total: number;
}

export type QuestionPage = Paginated<Question>;

export type { Subject, Topic, ISODate, ExamPaper, Question };
