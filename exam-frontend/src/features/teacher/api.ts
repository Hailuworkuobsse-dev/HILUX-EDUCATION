import { api } from '@/lib/api';
import type {
  BulkImportResult,
  BulkImportValidationResult,
  PaperFilter,
  PaperFormPayload,
  QuestionFilter,
  QuestionFormPayload,
  QuestionPage,
  ReviewDecision,
  TeacherOverview,
  TeacherPaperDetail
} from '@/types/teacher';
import type { ExamPaper, Subject, Topic } from '@/types/exam';
import type { Question } from '@/types/question';

export const teacherApi = {
  overview: () => api.get<TeacherOverview>('/teacher/overview'),

  // Papers
  listPapers: (filter: PaperFilter = {}) =>
    api.get<ExamPaper[]>('/teacher/papers', {
      query: {
        subjectId: filter.subjectId,
        status: filter.status,
        search: filter.search
      }
    }),
  getPaper: (id: string) => api.get<TeacherPaperDetail>(`/teacher/papers/${id}`),
  createPaper: (payload: PaperFormPayload) =>
    api.post<ExamPaper>('/teacher/papers', payload),
  updatePaper: (id: string, payload: Partial<PaperFormPayload>) =>
    api.patch<ExamPaper>(`/teacher/papers/${id}`, payload),
  deletePaper: (id: string) => api.delete<{ message: string }>(`/teacher/papers/${id}`),
  submitPaperReview: (id: string) =>
    api.post<ExamPaper>(`/teacher/papers/${id}/submit-review`),
  approvePaper: (id: string) =>
    api.post<ExamPaper>(`/teacher/papers/${id}/approve`),
  rejectPaper: (id: string, reason: string) =>
    api.post<ExamPaper>(`/teacher/papers/${id}/reject`, { reason }),
  publishPaper: (id: string) => api.post<ExamPaper>(`/teacher/papers/${id}/publish`),
  archivePaper: (id: string) => api.post<ExamPaper>(`/teacher/papers/${id}/archive`),

  // Questions
  listQuestions: (filter: QuestionFilter = {}) =>
    api.get<QuestionPage>('/teacher/questions', {
      query: {
        subjectId: filter.subjectId,
        topicId: filter.topicId,
        difficulty: filter.difficulty,
        status: filter.status,
        search: filter.search,
        page: filter.page,
        pageSize: filter.pageSize
      }
    }),
  getQuestion: (id: string) => api.get<Question>(`/teacher/questions/${id}`),
  createQuestion: (payload: QuestionFormPayload) =>
    api.post<Question>('/teacher/questions', payload),
  updateQuestion: (id: string, payload: Partial<QuestionFormPayload>) =>
    api.patch<Question>(`/teacher/questions/${id}`, payload),
  deleteQuestion: (id: string) =>
    api.delete<{ message: string }>(`/teacher/questions/${id}`),
  submitQuestionReview: (id: string) =>
    api.post<Question>(`/teacher/questions/${id}/submit-review`),
  reviewQuestion: (id: string, decision: ReviewDecision, reason?: string) =>
    api.post<Question>(`/teacher/questions/${id}/review`, { decision, reason }),
  publishQuestion: (id: string) =>
    api.post<Question>(`/teacher/questions/${id}/publish`),
  archiveQuestion: (id: string) =>
    api.post<Question>(`/teacher/questions/${id}/archive`),

  // Review queue
  listReviewQueue: (kind: 'questions' | 'papers') =>
    api.get<Question[] | ExamPaper[]>(`/teacher/review-queue/${kind}`),

  // Bulk import
  validateImport: (csv: string) =>
    api.post<BulkImportValidationResult>('/teacher/questions/import/validate', { csv }),
  commitImport: (csv: string) =>
    api.post<BulkImportResult>('/teacher/questions/import', { csv }),

  // Taxonomy
  listSubjects: () => api.get<Subject[]>('/subjects'),
  listTopics: (subjectId: string) =>
    api.get<Topic[]>('/topics', { query: { subjectId } })
};
