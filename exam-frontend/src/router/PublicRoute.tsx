import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/lib/roles';

/**
 * Auth-only pages (login, register, OTP, password reset). Signed-in users are
 * bounced to their role's home instead of seeing a login form.
 */
export function PublicRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Outlet />;

  // A token exists but /auth/me hasn't resolved yet — don't guess the role.
  if (!user) return <LoadingScreen />;

  const from = (location.state as { from?: string } | null)?.from;
  return <Navigate to={from ?? ROLE_HOME[user.role]} replace />;
}
