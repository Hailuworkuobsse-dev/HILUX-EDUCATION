import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { Alert, Button, Input } from '@/components/ui';
import { useForgotPassword } from '@/features/auth/hooks';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful }
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgot.mutate(values);
      toast.success('Check your inbox');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not send reset link.';
      toast.error('Request failed', msg);
    }
  });

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot your password?"
        description="Enter your email or phone and we'll send reset instructions."
        footer={
          <>
            Remembered it?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-brand-300 hover:underline">
              Back to sign in
            </Link>
          </>
        }
      >
        {isSubmitSuccessful ? (
          <Alert tone="success">
            If an account exists, we&apos;ve sent reset instructions. Check your inbox / SMS.
          </Alert>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Email or phone"
              placeholder="you@example.com"
              leftIcon={<AtSign className="h-4 w-4" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting || forgot.loading}
            >
              Send reset instructions
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
