import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { Alert, Button, PasswordInput } from '@/components/ui';
import { useResetPassword } from '@/features/auth/hooks';
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  const reset = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });
  const password = watch('password');

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard title="Invalid reset link" description="This link is missing a token.">
          <Alert tone="danger">Please request a new reset link.</Alert>
          <Button fullWidth onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}>
            Request new link
          </Button>
        </AuthCard>
      </AuthLayout>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await reset.mutate({ token, password: values.password });
      toast.success('Password updated', 'Sign in with your new password.');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Reset failed.';
      toast.error('Reset failed', msg);
    }
  });

  return (
    <AuthLayout>
      <AuthCard
        title="Choose a new password"
        description="Pick something strong and memorable."
        footer={
          <>
            <Link to={ROUTES.LOGIN} className="font-medium text-brand-300 hover:underline">
              Back to sign in
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <PasswordInput
              label="New password"
              leftIcon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>
          <PasswordInput
            label="Confirm new password"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" size="lg" fullWidth loading={isSubmitting || reset.loading}>
            Reset password
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
