import { api } from '@/lib/api';
import type { ExamPaper, Subject, Topic } from '@/types/exam';
import type { Attempt, AttemptResult } from '@/types/attempt';
import type {
  DueReview,
  ProgressPoint,
  StudentOverview,
  TopicAccuracy
} from '@/types/analytics';
import type { CourseEnrollment } from '@/types/subscription';
import type { StartAttemptPayload } from '@/types/practice';

export interface CourseSummary extends Subject {
  enrolled: boolean;
  trialEndsAt: string | null;
  subscriptionStatus: CourseEnrollment['status'] | 'none';
}

export interface CourseDetail extends CourseSummary {
  topics: Topic[];
  papers: ExamPaper[];
}

export interface ListAttemptsQuery {
  status?: 'in_progress' | 'graded';
  limit?: number;
  page?: number;
}

export const studentApi = {
  // Courses / subjects
  listCourses: () => api.get<CourseSummary[]>('/courses'),
  getCourse: (subjectId: string) => api.get<CourseDetail>(`/courses/${subjectId}`),
  enroll: (subjectId: string) => api.post<CourseEnrollment>('/enrollments', { subjectId }),

  // Papers
  listPapers: (subjectId?: string) =>
    api.get<ExamPaper[]>('/papers', { query: { subjectId } }),

  // Attempts
  startAttempt: (payload: StartAttemptPayload) => api.post<Attempt>('/attempts', payload),
  getAttempt: (attemptId: string) => api.get<Attempt>(`/attempts/${attemptId}`),
  listAttempts: (q: ListAttemptsQuery = {}) =>
    api.get<Attempt[]>('/attempts', {
      query: { status: q.status, limit: q.limit, page: q.page }
    }),
  saveAnswer: (attemptId: string, questionId: string, selectedOptionId: string | null) =>
    api.patch<{ message: string }>(`/attempts/${attemptId}/answers/${questionId}`, {
      selectedOptionId
    }),
  submitAttempt: (attemptId: string) =>
    api.post<AttemptResult>(`/attempts/${attemptId}/submit`),
  getAttemptResult: (attemptId: string) =>
    api.get<AttemptResult>(`/attempts/${attemptId}/result`),

  // Analytics
  overview: () => api.get<StudentOverview>('/analytics/me/overview'),
  topicAccuracy: () => api.get<TopicAccuracy[]>('/analytics/me/topics'),
  progress: () => api.get<ProgressPoint[]>('/analytics/me/progress'),
  dueReviews: () => api.get<DueReview[]>('/analytics/me/due-reviews')
};
