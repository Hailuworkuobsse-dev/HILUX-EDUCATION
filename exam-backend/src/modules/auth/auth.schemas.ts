import { z } from 'zod';

// ─── Shared fragments ─────────────────────────────────────────────────────

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email')
  .max(255)
  .transform((v) => v.toLowerCase());

const phone = z
  .string()
  .trim()
  .regex(/^(\+251|0)?9\d{8}$/, 'Enter a valid Ethiopian phone number');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

/** Accepts either an email or an Ethiopian phone number. */
const identifier = z
  .string()
  .trim()
  .min(1, 'Email or phone is required')
  .refine(
    (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(\+251|0)?9\d{8}$/.test(v),
    { message: 'Enter a valid email or Ethiopian phone number' }
  );

// ─── Endpoint schemas ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name')
    .max(120, 'Name is too long'),
  email,
  phone,
  password,
  role: z.enum(['student', 'mentor'], {
    errorMap: () => ({ message: 'Role must be student or mentor' })
  })
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier,
  password: z.string().min(1, 'Password is required')
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code')
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required')
});
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const forgotPasswordSchema = z.object({
  identifier
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
