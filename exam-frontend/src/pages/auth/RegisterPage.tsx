import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Lock, Phone, User } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { RoleSelector } from '@/features/auth/components/RoleSelector';
import { Button, Checkbox, Input, PasswordInput } from '@/components/ui';
import { useRegister } from '@/features/auth/hooks';
import { registerSchema, type RegisterInput } from '@/features/auth/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student', agree: false }
  });

  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await registerMutation.mutate(values);
      toast.success('Account created', 'We sent a verification code.');
      navigate(ROUTES.VERIFY_OTP, {
        replace: true,
        state: {
          challengeId: result.challenge.challengeId,
          maskedTarget: result.challenge.maskedTarget,
          channel: result.challenge.channel
        }
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Registration failed.';
      toast.error('Registration failed', msg);
    }
  });

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description={`Start your ${APP.TRIAL_DAYS}-day free trial. No card required.`}
        footer={
          <>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-brand-300 hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Full name"
            placeholder="Abebe Kebede"
            leftIcon={<User className="h-4 w-4" />}
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<AtSign className="h-4 w-4" />}
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="09XXXXXXXX"
            leftIcon={<Phone className="h-4 w-4" />}
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RoleSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.role?.message}
              />
            )}
          />
          <div>
            <PasswordInput
              label="Password"
              placeholder="At least 8 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>
          <PasswordInput
            label="Confirm password"
            placeholder="Repeat your password"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Checkbox
            label={
              <>
                I agree to the{' '}
                <Link to="/terms" className="text-brand-300 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-brand-300 hover:underline">
                  Privacy Policy
                </Link>
              </>
            }
            error={errors.agree?.message}
            {...register('agree')}
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting || registerMutation.loading}
          >
            Create account
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
