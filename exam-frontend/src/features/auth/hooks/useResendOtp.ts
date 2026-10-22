import { useMutation } from '@/hooks/useMutation';
import { authApi, type ResendOtpPayload } from '../api';
import type { OtpChallenge } from '@/types/auth';

export function useResendOtp() {
  return useMutation<OtpChallenge, ResendOtpPayload>((vars) => authApi.resendOtp(vars));
}
