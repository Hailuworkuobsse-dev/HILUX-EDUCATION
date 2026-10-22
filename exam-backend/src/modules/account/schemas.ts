import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  notifications: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional()
    })
    .optional(),
  language: z.string().min(2).max(8).optional(),
  timezone: z.string().max(64).nullable().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password is too long')
});

export const deleteAccountSchema = z.object({
  confirm: z.literal('DELETE', {
    errorMap: () => ({ message: 'Type DELETE to confirm' })
  }),
  reason: z.string().trim().max(500).optional()
});

export const downloadExportSchema = z.object({
  token: z.string().min(1, 'token query parameter is required')
});
