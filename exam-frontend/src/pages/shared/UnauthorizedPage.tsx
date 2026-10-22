import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME, ROLE_LABELS } from '@/lib/roles';
import { ROUTES } from '@/router/routes';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const home = user ? ROLE_HOME[user.role] : ROUTES.LOGIN;

  return (
    <Container size="sm" className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <PageMeta
        title="Not available for your role"
        description="Your account type does not have access to that page."
      />

      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-warning/30 bg-warning/10 text-warning">
        <ShieldAlert className="h-7 w-7" />
      </span>

      <h1 className="mt-6 text-xl font-bold text-fg">You can't open that page</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">
        {user ? (
          <>
            Your account is signed in as{' '}
            <span className="font-semibold text-fg">{ROLE_LABELS[user.role]}</span>, which does
            not have access to this area.
          </>
        ) : (
          <>Sign in with an account that has access to this area.</>
        )}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to={home}>{user ? 'Back to my dashboard' : 'Sign in'}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to={ROUTES.SUPPORT}>Contact support</Link>
        </Button>
      </div>
    </Container>
  );
}
