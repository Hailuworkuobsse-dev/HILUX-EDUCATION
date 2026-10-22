import type { User } from '@prisma/client';

export interface AuthUserDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'mentor' | 'teacher' | 'admin';
  avatarUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
}

export function toAuthUser(user: User): AuthUserDTO {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    trialStartedAt: user.trialStartedAt?.toISOString() ?? null,
    trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString()
  };
}
