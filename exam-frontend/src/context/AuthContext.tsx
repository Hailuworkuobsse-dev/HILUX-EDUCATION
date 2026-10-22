import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import {
  clearTokens,
  getAccessToken,
  setTokens,
  UNAUTHORIZED_EVENT
} from '@/lib/api';
import type { AuthSession, AuthUser } from '@/types/auth';

export interface AuthContextValue {
  /** Null until `/auth/me` resolves — see `SessionBootstrap`. */
  user: AuthUser | null;
  /** True when a token is stored, even before the profile has loaded. */
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAccessToken());

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUserState(null);
    setIsAuthenticated(false);
  }, []);

  const setSession = useCallback((session: AuthSession) => {
    setTokens(session.accessToken, session.refreshToken);
    setUserState(session.user);
    setIsAuthenticated(true);
  }, []);

  // The API layer fires this when a 401 could not be refreshed.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, setUser, setSession, logout }),
    [user, isAuthenticated, setUser, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
