import { z } from 'zod';

/**
 * Field schemas mirroring the backend's `auth.schemas.ts` so a value that
 * passes here also passes server-side (same messages, same rules).
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email')
  .max(255)
  .transform((v) => v.toLowerCase());

/** Accepts +2519XXXXXXXX, 09XXXXXXXX and 9XXXXXXXX. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+251|0)?9\d{8}$/, 'Enter a valid Ethiopian phone number');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

/** Email *or* Ethiopian phone number. */
export const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Email or phone is required')
  .refine(
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(\+251|0)?9\d{8}$/.test(v),
    { message: 'Enter a valid email or Ethiopian phone number' }
  );

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required')
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Normalize a phone number to E.164 (+2519XXXXXXXX); returns null if invalid. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('251')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) return `+251${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('9')) return `+251${digits}`;
  return null;
}
