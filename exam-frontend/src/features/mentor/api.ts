import { api } from '@/lib/api';
import type {
  Mentee,
  MenteeDetail,
  MentorMessage,
  MentorOverview,
  MentorProfileDetail,
  MentorReport,
  MentorReportStatus,
  MentorThread
} from '@/types/mentor';

export interface ListMenteesQuery {
  search?: string;
  risk?: 'all' | 'low' | 'medium' | 'high';
}

export interface UpdateMentorProfilePayload {
  bio?: string;
  subjects?: string[];
  availability?: 'available' | 'busy' | 'offline';
  yearsOfExperience?: number;
  languages?: string[];
}

export const mentorApi = {
  overview: () => api.get<MentorOverview>('/mentor/overview'),

  listMentees: (q: ListMenteesQuery = {}) =>
    api.get<Mentee[]>('/mentor/mentees', { query: { search: q.search, risk: q.risk } }),
  getMentee: (id: string) => api.get<MenteeDetail>(`/mentor/mentees/${id}`),

  listThreads: () => api.get<MentorThread[]>('/mentor/threads'),
  getThread: (id: string) => api.get<MentorThread>(`/mentor/threads/${id}`),
  listMessages: (threadId: string, since?: string) =>
    api.get<MentorMessage[]>(`/mentor/threads/${threadId}/messages`, {
      query: { since }
    }),
  sendMessage: (threadId: string, body: string) =>
    api.post<MentorMessage>(`/mentor/threads/${threadId}/messages`, { body }),
  markThreadRead: (threadId: string) =>
    api.patch<{ message: string }>(`/mentor/threads/${threadId}/read`),
  unreadThreadCount: () => api.get<{ count: number }>('/mentor/threads/unread-count'),

  listReports: (status?: MentorReportStatus) =>
    api.get<MentorReport[]>('/mentor/reports', { query: { status } }),
  updateReportStatus: (id: string, status: MentorReportStatus) =>
    api.patch<MentorReport>(`/mentor/reports/${id}`, { status }),

  getProfile: () => api.get<MentorProfileDetail>('/mentor/profile'),
  updateProfile: (data: UpdateMentorProfilePayload) =>
    api.patch<MentorProfileDetail>('/mentor/profile', data)
};
