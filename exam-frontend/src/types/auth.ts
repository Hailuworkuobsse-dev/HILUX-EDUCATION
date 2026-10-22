import type { Role } from '@/lib/roles';
import type { ID, ISODate } from './common';

/** Mirrors the backend `AuthUserDTO` (src/modules/auth/auth.mappers.ts). */
export interface AuthUser {
  id: ID;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  trialStartedAt: ISODate | null;
  trialEndsAt: ISODate | null;
  createdAt: ISODate;
}

/** Returned by /auth/login, /auth/verify-otp and /auth/refresh. */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds. */
  expiresIn: number;
  user: AuthUser;
}

export type OtpChannel = 'sms' | 'email';
export type OtpPurpose = 'register' | 'login' | 'reset_password';

/** Mirrors the backend `OtpChallengeDTO`. */
export interface OtpChallenge {
  challengeId: ID;
  channel: OtpChannel;
  maskedTarget: string;
  expiresAt: ISODate;
}
