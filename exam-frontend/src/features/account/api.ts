import { api } from '@/lib/api';
import type {
  AccountPreferences,
  ExportJob,
  NotificationPreferences
} from '@/types/account';

export interface UpdatePreferencesPayload {
  notifications?: Partial<NotificationPreferences>;
  language?: string;
  timezone?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountPayload {
  confirm: 'DELETE';
  reason?: string;
}

export const accountApi = {
  getPreferences: () => api.get<AccountPreferences>('/me/preferences'),
  updatePreferences: (p: UpdatePreferencesPayload) =>
    api.patch<AccountPreferences>('/me/preferences', p),
  changePassword: (p: ChangePasswordPayload) =>
    api.post<{ message: string }>('/me/password', p),
  requestExport: () => api.post<ExportJob>('/me/export'),
  deleteAccount: (p: DeleteAccountPayload) =>
    api.post<{ message: string }>('/me/delete-account', p)
};
