import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Lock } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { Button, Divider, Input, PasswordInput } from '@/components/ui';
import { useLogin } from '@/features/auth/hooks';
import { loginSchema, type LoginInput } from '@/features/auth/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { ROLE_HOME } from '@/lib/roles';
import { ROUTES } from '@/router/routes';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await login.mutate(values);
      toast.success('Welcome back!');
      const from = (location.state as { from?: string } | null)?.from;
      const roleHome = ROLE_HOME[session.user.role];
      // Only honour `from` when the user's role can actually access it.
      const fromAllowed =
        from &&
        (from === `/${session.user.role}` ||
          from.startsWith(`/${session.user.role}/`) ||
          from === '/profile' ||
          from === '/settings');
      navigate(fromAllowed && from ? from : roleHome, { replace: true });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Sign-in failed. Please try again.';
      toast.error('Sign-in failed', msg);
    }
  });

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue your practice."
        footer={
          <>
            New here?{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-brand-300 hover:underline">
              Create an account
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Email or phone"
            placeholder="you@example.com or 09XXXXXXXX"
            leftIcon={<AtSign className="h-4 w-4" />}
            autoComplete="username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-end">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-medium text-brand-300 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting || login.loading}
          >
            Sign in
          </Button>
          <Divider label="or" />
          <p className="text-center text-xs text-fg-muted">
            No account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-brand-300 hover:underline"
            >
              Start your free trial
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
