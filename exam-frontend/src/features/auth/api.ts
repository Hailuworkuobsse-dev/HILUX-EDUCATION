import { api } from '@/lib/api';
import type { AuthSession, AuthUser, OtpChallenge } from '@/types/auth';
import type { Role } from '@/lib/roles';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<Role, 'student' | 'mentor'>;
}

export interface VerifyOtpPayload {
  challengeId: string;
  code: string;
}

export interface ResendOtpPayload {
  challengeId: string;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface RegisterResponse {
  session: AuthSession;
  challenge: OtpChallenge;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthSession>('/auth/login', payload, { auth: false }),
  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>('/auth/register', payload, { auth: false }),
  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<AuthSession>('/auth/verify-otp', payload, { auth: false }),
  resendOtp: (payload: ResendOtpPayload) =>
    api.post<OtpChallenge>('/auth/resend-otp', payload, { auth: false }),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  me: () => api.get<AuthUser>('/auth/me'),
  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<{ message: string }>('/auth/forgot-password', payload, { auth: false }),
  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<{ message: string }>('/auth/reset-password', payload, { auth: false })
};
