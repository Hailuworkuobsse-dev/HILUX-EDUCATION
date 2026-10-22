import { Navigate, Outlet } from 'react-router-dom';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/roles';
import { ROUTES } from './routes';

export interface RoleGuardProps {
  /** Roles allowed to render the child routes. */
  allow: Role[];
}

/**
 * Role gate for a group of routes. While the profile is still loading we show
 * a spinner rather than flashing the unauthorized page.
 */
export function RoleGuard({ allow }: RoleGuardProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (!user) return <LoadingScreen />;
  if (!allow.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
