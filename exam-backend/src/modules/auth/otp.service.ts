import type { User } from '@prisma/client';
import { ApiError } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import { sha256 } from '../../lib/crypto.js';
import { sendOtp } from '../../lib/notifications.js';
import { maskTarget } from '../../lib/validators.js';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export type OtpPurpose = 'register' | 'login' | 'reset_password';
export type OtpChannel = 'sms' | 'email';

export interface OtpChallengeDTO {
  challengeId: string;
  channel: 'sms' | 'email';
  maskedTarget: string;
  expiresAt: string;
}

function generateOtpCode(): string {
  // 6-digit numeric code — not crypto-strong but adequate for short TTL OTP.
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Create a fresh OTP challenge, invalidate any prior open challenge for the
 * same user + purpose, and deliver the code.
 */
export async function issueOtp(params: {
  userId: string;
  channel: OtpChannel;
  target: string;
  purpose: OtpPurpose;
  ttlMinutes?: number;
}): Promise<OtpChallengeDTO> {
  const ttlMinutes = params.ttlMinutes ?? OTP_TTL_MINUTES;
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

  // Supersede any prior open challenge for the same user + purpose.
  await prisma.otpChallenge.updateMany({
    where: { userId: params.userId, purpose: params.purpose, consumedAt: null },
    data: { consumedAt: new Date() }
  });

  const challenge = await prisma.otpChallenge.create({
    data: {
      userId: params.userId,
      channel: params.channel,
      target: params.target,
      codeHash: sha256(code),
      purpose: params.purpose,
      expiresAt
    }
  });

  await sendOtp(params.channel, params.target, code);

  return {
    challengeId: challenge.id,
    channel: params.channel,
    maskedTarget: maskTarget(params.channel, params.target),
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Resend OTP by reusing the same challenge id (frontend keeps the id and
 * does not update its local state on resend).
 */
export async function resendOtp(challengeId: string): Promise<OtpChallengeDTO> {
  const challenge = await prisma.otpChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw ApiError.badRequest('Verification challenge not found');
  if (challenge.consumedAt) {
    throw ApiError.badRequest('This verification challenge has already been used');
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await prisma.otpChallenge.update({
    where: { id: challengeId },
    data: {
      codeHash: sha256(code),
      attempts: 0,
      expiresAt
    }
  });

  await sendOtp(challenge.channel, challenge.target, code);

  return {
    challengeId: challenge.id,
    channel: challenge.channel,
    maskedTarget: maskTarget(challenge.channel, challenge.target),
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Verify an OTP and mark the user verified on the challenge's channel.
 * Returns the updated user.
 *
 * Idempotency: if the challenge has already been consumed AND the user is
 * verified, we return the current user instead of erroring — this handles
 * the case where the client lost the response of a successful verification.
 */
export async function verifyOtpAndMarkUser(
  challengeId: string,
  code: string
): Promise<{ user: User }> {
  const challenge = await prisma.otpChallenge.findUnique({
    where: { id: challengeId },
    include: { user: true }
  });

  if (!challenge) throw ApiError.badRequest('Invalid verification challenge');

  if (challenge.consumedAt) {
    // Idempotent path: user already verified
    if (challenge.user.emailVerified || challenge.user.phoneVerified) {
      return { user: challenge.user };
    }
    throw ApiError.badRequest('This code has already been used. Please request a new one.');
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('Verification code has expired');
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    throw ApiError.badRequest(
      'Too many incorrect attempts. Please request a new code.'
    );
  }

  if (challenge.codeHash !== sha256(code)) {
    await prisma.otpChallenge.update({
      where: { id: challengeId },
      data: { attempts: { increment: 1 } }
    });
    throw ApiError.badRequest('Incorrect verification code');
  }

  // Success: mark consumed + verify the channel; activate if any channel verified.
  const updated = await prisma.$transaction(async (tx) => {
    const updates: {
      emailVerified?: boolean;
      phoneVerified?: boolean;
      status?: 'active';
    } = {};

    if (challenge.channel === 'email') updates.emailVerified = true;
    if (challenge.channel === 'sms') updates.phoneVerified = true;

    const willEmail = updates.emailVerified ?? challenge.user.emailVerified;
    const willPhone = updates.phoneVerified ?? challenge.user.phoneVerified;
    if (willEmail || willPhone) updates.status = 'active';

    const u = await tx.user.update({
      where: { id: challenge.userId },
      data: updates
    });

    await tx.otpChallenge.update({
      where: { id: challengeId },
      data: { consumedAt: new Date() }
    });

    return u;
  });

  return { user: updated };
}
