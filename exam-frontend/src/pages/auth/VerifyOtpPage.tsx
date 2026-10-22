import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { OtpInput } from '@/features/auth/components/OtpInput';
import { Alert, Button } from '@/components/ui';
import { useResendOtp, useVerifyOtp } from '@/features/auth/hooks';
import { useToast } from '@/hooks/useToast';
import { useCountdown } from '@/hooks/useCountdown';
import { ApiError } from '@/lib/api';
import { ROLE_HOME } from '@/lib/roles';
import { ROUTES } from '@/router/routes';

interface VerifyOtpState {
  challengeId: string;
  maskedTarget: string;
  channel: 'sms' | 'email';
}

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const countdown = useCountdown(60);

  const state = location.state as VerifyOtpState | null;
  const challengeId = state?.challengeId;

  useEffect(() => {
    setError(undefined);
  }, [code]);

  if (!challengeId) {
    return <Navigate to={ROUTES.REGISTER} replace />;
  }

  const submit = async () => {
    try {
      const session = await verifyOtp.mutate({ challengeId, code });
      toast.success('Verified! Welcome aboard.');
      navigate(ROLE_HOME[session.user.role], { replace: true });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Verification failed.';
      setError(msg);
      toast.error('Verification failed', msg);
    }
  };

  const resend = async () => {
    try {
      await resendOtp.mutate({ challengeId });
      toast.success('New code sent');
      setCode('');
      countdown.reset();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not resend code.';
      toast.error('Could not resend', msg);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Verify your account"
        description={`We sent a 6-digit code to ${state?.maskedTarget ?? 'your phone'}.`}
        footer={
          <>
            Wrong info?{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-brand-300 hover:underline">
              Go back
            </Link>
          </>
        }
      >
        <div className="flex justify-center py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <OtpInput
          value={code}
          onChange={setCode}
          error={error}
          disabled={verifyOtp.loading}
          autoFocus
        />

        {state?.channel === 'sms' && (
          <Alert tone="info">
            Didn&apos;t get the SMS? Make sure your phone is on and has network coverage.
          </Alert>
        )}

        <Button
          size="lg"
          fullWidth
          loading={verifyOtp.loading}
          disabled={code.length !== 6}
          onClick={submit}
        >
          Verify
        </Button>

        <div className="text-center text-xs text-fg-muted">
          {countdown.expired ? (
            <button
              type="button"
              onClick={resend}
              disabled={resendOtp.loading}
              className="font-medium text-brand-300 hover:underline disabled:opacity-60"
            >
              {resendOtp.loading ? 'Sending…' : 'Resend code'}
            </button>
          ) : (
            <>Resend available in {countdown.remaining}s</>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
