import { useMutation } from '@/hooks/useMutation';
import { useAuth } from '@/context/AuthContext';
import { authApi, type VerifyOtpPayload } from '../api';
import type { AuthSession } from '@/types/auth';

export function useVerifyOtp() {
  const { setSession } = useAuth();
  return useMutation<AuthSession, VerifyOtpPayload>(async (vars) => {
    const session = await authApi.verifyOtp(vars);
    setSession(session);
    return session;
  });
}
