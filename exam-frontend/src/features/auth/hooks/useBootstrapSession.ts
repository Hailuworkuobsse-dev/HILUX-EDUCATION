import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { authApi } from '../api';

export function useBootstrapSession(): void {
  const { isAuthenticated, setUser, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) logout();
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setUser, logout]);
}
