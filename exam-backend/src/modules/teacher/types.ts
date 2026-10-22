export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'draft' | 'review' | 'published' | 'archived';
export type PaperStatus = 'draft' | 'review' | 'published' | 'archived';

// ─── Form inputs ─────────────────────────────────────────────────────────
// Inferred from the Zod schemas in ./schemas.ts and re-exported here so the
// services/controllers can import every teacher-module type from one place.
export type {
  PaperFormInput,
  QuestionFormInput,
  QuestionReviewInput
} from './schemas.js';

export interface ExamPaperDTO {
  id: string;
  subjectId: string;
  title: string;
  year: number;
  durationMinutes: number;
  totalQuestions: number;
  difficulty: Difficulty;
  status: PaperStatus;
  language: string;
  createdBy: string;
  reviewedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOptionDTO {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface QuestionDTO {
  id: string;
  subjectId: string;
  topicId: string;
  paperId: string | null;
  difficulty: Difficulty;
  year: number | null;
  language: string;
  prompt: string;
  options: QuestionOptionDTO[];
  correctOptionId: string;
  explanation: string | null;
  status: QuestionStatus;
  createdBy: string;
  reviewedBy: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicDTO {
  id: string;
  subjectId: string;
  name: string;
}

export interface TeacherPaperDetailDTO extends ExamPaperDTO {
  questions: QuestionDTO[];
  topics: TopicDTO[];
}

export interface TeacherOverviewDTO {
  draftQuestions: number;
  reviewQuestions: number;
  publishedQuestions: number;
  draftPapers: number;
  publishedPapers: number;
  pendingReviews: number;
  flaggedQuestions: number;
}

export interface PaginatedDTO<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BulkImportRowDTO {
  rowNumber: number;
  status: 'valid' | 'invalid';
  subjectName: string | null;
  prompt: string | null;
  errors: string[];
}

export interface BulkImportValidationResultDTO {
  rows: BulkImportRowDTO[];
  summary: { total: number; valid: number; invalid: number };
}

export interface BulkImportResultDTO {
  imported: number;
  skipped: number;
  total: number;
}

// ─── Internal (parsed row, not returned to client) ───────────────────────

export interface ParsedImportRow {
  rowNumber: number;
  subjectId: string | null;
  subjectName: string | null;
  topicId: string | null;
  difficulty: Difficulty | null;
  year: number | null;
  language: string | null;
  prompt: string;
  options: string[];  // 2-5 entries, ordered A..E
  correctIndex: number;  // -1 if invalid
  explanation: string | null;
  errors: string[];
}
