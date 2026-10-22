import { useMutation } from '@/hooks/useMutation';
import { authApi, type ResetPasswordPayload } from '../api';

export function useResetPassword() {
  return useMutation<{ message: string }, ResetPasswordPayload>((vars) =>
    authApi.resetPassword(vars)
  );
}
