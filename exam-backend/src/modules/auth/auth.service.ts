import type { User } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { randomToken, sha256 } from '../../lib/crypto.js';
import { normalizeEmail, normalizePhone, tryNormalizePhone } from '../../lib/validators.js';
import { sendEmail, sendSms } from '../../lib/notifications.js';
import { writeAudit } from '../../lib/audit.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput
} from './auth.schemas.js';
import { issueOtp, verifyOtpAndMarkUser } from './otp.service.js';
import {
  issueSession,
  revokeAllForUser,
  type AuthSessionDTO,
  type IssueSessionContext
} from './token.service.js';
import { toAuthUser } from './auth.mappers.js';

export interface RegisterResponse {
  session: AuthSessionDTO;
  challenge: {
    challengeId: string;
    channel: 'sms' | 'email';
    maskedTarget: string;
    expiresAt: string;
  };
}

// ─── Register ─────────────────────────────────────────────────────────────

export async function registerUser(
  input: RegisterInput,
  ctx: IssueSessionContext
): Promise<RegisterResponse> {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { id: true, email: true, phone: true }
  });
  if (existing) {
    if (existing.email === email) throw ApiError.conflict('Email is already registered');
    throw ApiError.conflict('Phone number is already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const trialStartedAt = new Date();
  const trialEndsAt = new Date(
    trialStartedAt.getTime() + env.TRIAL_DAYS * 24 * 60 * 60 * 1000
  );

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      fullName: input.fullName.trim(),
      role: input.role,
      status: 'pending_verification',
      trialStartedAt,
      trialEndsAt,
      notificationPreference: {
        create: { email: true, sms: true, push: false, language: 'en' }
      },
      ...(input.role === 'mentor'
        ? { mentorProfile: { create: {} } }
        : {})
    }
  });

  // Deliver OTP to the phone by default (SMS is more reliable in Ethiopia
  // than email for most students). Email verification can be added later.
  const challenge = await issueOtp({
    userId: user.id,
    channel: 'sms',
    target: phone,
    purpose: 'register'
  });

  await writeAudit({
    actorId: user.id,
    action: 'user.registered',
    resourceType: 'user',
    resourceId: user.id,
    meta: { role: user.role },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  });

  const session = await issueSession(user, ctx);

  return {
    session,
    challenge: {
      challengeId: challenge.challengeId,
      channel: challenge.channel,
      maskedTarget: challenge.maskedTarget,
      expiresAt: challenge.expiresAt
    }
  };
}

// ─── Login ────────────────────────────────────────────────────────────────

export async function loginUser(
  input: LoginInput,
  ctx: IssueSessionContext
): Promise<AuthSessionDTO> {
  const identifier = input.identifier.trim();
  const isEmail = identifier.includes('@');

  const email = isEmail ? normalizeEmail(identifier) : null;
  const phone = isEmail ? null : tryNormalizePhone(identifier);

  if (!email && !phone) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const user = await prisma.user.findFirst({
    where: email ? { email } : { phone: phone! }
  });

  if (!user) {
    // Dummy compare keeps timing closer to the "user exists" path.
    await verifyPassword(input.password, '$2a$12$invalidinvalidinvalidinvalidinvalidinv');
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.status === 'suspended') {
    throw ApiError.forbidden('This account has been suspended');
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() }
  });

  const session = await issueSession(user, ctx);

  await writeAudit({
    actorId: user.id,
    action: 'user.login',
    resourceType: 'user',
    resourceId: user.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  });

  return session;
}

// ─── Verify / resend OTP are thin wrappers (logic lives in otp.service) ──

export async function verifyOtpAndIssueSession(
  challengeId: string,
  code: string,
  ctx: IssueSessionContext
): Promise<AuthSessionDTO> {
  const { user } = await verifyOtpAndMarkUser(challengeId, code);

  await writeAudit({
    actorId: user.id,
    action: user.emailVerified ? 'user.email_verified' : 'user.phone_verified',
    resourceType: 'user',
    resourceId: user.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  });

  return issueSession(user, ctx);
}

// ─── Logout ───────────────────────────────────────────────────────────────

export async function logoutUser(
  user: User,
  ctx: IssueSessionContext
): Promise<void> {
  await revokeAllForUser(user.id);

  await writeAudit({
    actorId: user.id,
    action: 'user.logout',
    resourceType: 'user',
    resourceId: user.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  });
}

// ─── Me ───────────────────────────────────────────────────────────────────

export function me(user: User) {
  return toAuthUser(user);
}

// ─── Forgot / reset password ─────────────────────────────────────────────

export async function requestPasswordReset(
  input: ForgotPasswordInput,
  ctx: IssueSessionContext
): Promise<void> {
  const identifier = input.identifier.trim();
  const isEmail = identifier.includes('@');

  const email = isEmail ? normalizeEmail(identifier) : null;
  const phone = isEmail ? null : tryNormalizePhone(identifier);

  if (!email && !phone) return; // silent — never leak invalid input shape

  const user = await prisma.user.findFirst({
    where: email ? { email } : { phone: phone! }
  });

  if (!user) return; // silent — never leak account existence

  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt }
  });

  const frontendOrigin = env.CORS_ORIGIN.split(',')[0]?.trim() || 'http://localhost:5173';
  const resetLink = `${frontendOrigin}/reset-password?token=${token}`;
  const minutes = 60;

  if (email) {
    await sendEmail(
      email,
      'Reset your ExamPrep password',
      `Click the link below to reset your password (valid for ${minutes} minutes):\n\n${resetLink}\n\nIf you didn't request this, ignore this email.`
    );
  } else {
    await sendSms(
      phone!,
      `ExamPrep password reset (valid ${minutes}m): ${resetLink}`
    );
  }

  await writeAudit({
    actorId: user.id,
    action: 'user.password_reset_requested',
    resourceType: 'user',
    resourceId: user.id,
    meta: { channel: email ? 'email' : 'sms' },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  });
}

export async function resetPassword(
  input: ResetPasswordInput,
  ctx: IssueSessionContext
): Promise<void> {
  const tokenHash = sha256(input.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record) throw ApiError.badRequest('Invalid reset link');
  if (record.usedAt) throw ApiError.badRequest('This reset link has already been used');
  if (record.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('This reset link has expired');
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  ]);

  await writeAudit({
    actorId: record.userId,
    action: 'user.password_changed',
    resourceType: 'user',
    resourceId: record.userId,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  });
}
