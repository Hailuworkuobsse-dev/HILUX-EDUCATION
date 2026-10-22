import { useMutation } from '@/hooks/useMutation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '../api';
import type { LoginInput } from '../schemas';
import type { AuthSession } from '@/types/auth';

export function useLogin() {
  const { setSession } = useAuth();
  return useMutation<AuthSession, LoginInput>(async (input) => {
    const session = await authApi.login(input);
    setSession(session);
    return session;
  });
}
