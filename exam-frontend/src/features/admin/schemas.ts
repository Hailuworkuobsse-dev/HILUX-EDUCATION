import { z } from 'zod';

export const changeRoleSchema = z.object({
  role: z.enum(['student', 'mentor', 'teacher', 'admin']),
  reason: z.string().trim().max(300).optional()
});
export type ChangeRoleValues = z.infer<typeof changeRoleSchema>;

export const changeStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'pending_verification']),
  reason: z.string().trim().min(10, 'Give a short reason (min 10 chars)').max(500)
});
export type ChangeStatusValues = z.infer<typeof changeStatusSchema>;

export const refundSchema = z.object({
  amount: z.number().min(0, 'Amount must be ≥ 0').optional(),
  reason: z.string().trim().min(10, 'Give a short reason (min 10 chars)').max(500)
});
export type RefundValues = z.infer<typeof refundSchema>;

export const resolveFlagSchema = z.object({
  resolution: z.enum(['unpublish', 'delete', 'keep']),
  reason: z.string().trim().min(10, 'Give a short reason (min 10 chars)').max(500)
});
export type ResolveFlagValues = z.infer<typeof resolveFlagSchema>;
