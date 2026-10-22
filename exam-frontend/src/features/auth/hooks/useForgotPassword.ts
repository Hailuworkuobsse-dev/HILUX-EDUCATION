import { useMutation } from '@/hooks/useMutation';
import { authApi } from '../api';
import type { ForgotPasswordInput } from '../schemas';

export function useForgotPassword() {
  return useMutation<{ message: string }, ForgotPasswordInput>((input) =>
    authApi.forgotPassword(input)
  );
}
