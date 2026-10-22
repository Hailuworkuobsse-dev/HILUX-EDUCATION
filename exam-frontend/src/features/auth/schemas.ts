import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from '@/lib/validators';

export { loginSchema } from '@/lib/validators';
export type { LoginInput } from '@/lib/validators';

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(['student', 'mentor']),
    agree: z.boolean().refine((v) => v === true, { message: 'You must accept the terms' })
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code')
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.union([emailSchema, phoneSchema])
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
