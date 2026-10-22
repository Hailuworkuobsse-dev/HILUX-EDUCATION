import { useMutation } from '@/hooks/useMutation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '../api';

export function useLogout() {
  const { logout } = useAuth();
  return useMutation<void, void>(async () => {
    try {
      await authApi.logout();
    } catch {
      /* best-effort; local session already invalidated below */
    }
    logout();
  });
}
