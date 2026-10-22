import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type { AccountPreferences, ExportJob } from '@/types/account';
import {
  accountApi,
  type ChangePasswordPayload,
  type DeleteAccountPayload,
  type UpdatePreferencesPayload
} from './api';

export function usePreferences() {
  return useQuery<AccountPreferences>(() => accountApi.getPreferences(), []);
}

export function useUpdatePreferences() {
  return useMutation<AccountPreferences, UpdatePreferencesPayload>((p) =>
    accountApi.updatePreferences(p)
  );
}

export function useChangePassword() {
  return useMutation<{ message: string }, ChangePasswordPayload>((p) =>
    accountApi.changePassword(p)
  );
}

export function useExportData() {
  return useMutation<ExportJob, void>(() => accountApi.requestExport());
}

export function useDeleteAccount() {
  return useMutation<{ message: string }, DeleteAccountPayload>((p) =>
    accountApi.deleteAccount(p)
  );
}
