import type { RequestHandler } from 'express';
import { validate } from '../../lib/validate.js';
import { ApiError } from '../../lib/errors.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema
} from './auth.schemas.js';
import {
  loginUser,
  logoutUser,
  me,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyOtpAndIssueSession
} from './auth.service.js';
import { issueOtp, resendOtp } from './otp.service.js';
import { ctxFromRequest, rotateRefreshToken } from './token.service.js';
import { prisma } from '../../lib/prisma.js';

// ─── POST /auth/register ──────────────────────────────────────────────────

export const registerHandler: RequestHandler = async (req, res) => {
  const input = validate(registerSchema, req.body);
  const result = await registerUser(input, ctxFromRequest(req));
  res.status(201).json(result);
};

// ─── POST /auth/login ─────────────────────────────────────────────────────

export const loginHandler: RequestHandler = async (req, res) => {
  const input = validate(loginSchema, req.body);
  const session = await loginUser(input, ctxFromRequest(req));
  res.json(session);
};

// ─── POST /auth/verify-otp ────────────────────────────────────────────────

export const verifyOtpHandler: RequestHandler = async (req, res) => {
  const input = validate(verifyOtpSchema, req.body);
  const session = await verifyOtpAndIssueSession(
    input.challengeId,
    input.code,
    ctxFromRequest(req)
  );
  res.json(session);
};

// ─── POST /auth/resend-otp ────────────────────────────────────────────────

export const resendOtpHandler: RequestHandler = async (req, res) => {
  const input = validate(resendOtpSchema, req.body);
  const challenge = await resendOtp(input.challengeId);
  res.json(challenge);
};

// ─── POST /auth/refresh ───────────────────────────────────────────────────

export const refreshHandler: RequestHandler = async (req, res) => {
  const input = validate(refreshSchema, req.body);
  const session = await rotateRefreshToken(input.refreshToken, ctxFromRequest(req));
  res.json({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: session.expiresIn
  });
};

// ─── POST /auth/logout ────────────────────────────────────────────────────

export const logoutHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  await logoutUser(req.user, ctxFromRequest(req));
  res.json({ message: 'Logged out' });
};

// ─── GET /auth/me ─────────────────────────────────────────────────────────

export const meHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(me(req.user));
};

// ─── POST /auth/forgot-password ───────────────────────────────────────────

export const forgotPasswordHandler: RequestHandler = async (req, res) => {
  const input = validate(forgotPasswordSchema, req.body);
  await requestPasswordReset(input, ctxFromRequest(req));
  // Always return the same message to prevent account enumeration.
  res.json({
    message: 'If an account exists, reset instructions have been sent.'
  });
};

// ─── POST /auth/reset-password ────────────────────────────────────────────

export const resetPasswordHandler: RequestHandler = async (req, res) => {
  const input = validate(resetPasswordSchema, req.body);
  await resetPassword(input, ctxFromRequest(req));
  res.json({ message: 'Password updated. Please sign in.' });
};

// ─── POST /auth/resend-verification (helper for a logged-in unverified user)
// The frontend doesn't use this yet, but it's useful for future flows.
// Creates a new OTP challenge to the user's phone.

export const resendVerificationHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = req.user;

  if (user.phoneVerified) {
    throw ApiError.badRequest('Phone is already verified');
  }

  const challenge = await issueOtp({
    userId: user.id,
    channel: 'sms',
    target: user.phone,
    purpose: 'register'
  });

  res.json(challenge);
};

// Ensure the prisma import doesn't go unused (kept for future flows)
void prisma;
