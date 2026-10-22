import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  role: z.enum(['student', 'mentor', 'teacher', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'pending_verification']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25)
});

export const changeRoleSchema = z.object({
  role: z.enum(['student', 'mentor', 'teacher', 'admin']),
  reason: z.string().trim().max(300).optional()
});

export const changeStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'pending_verification']),
  reason: z.string().trim().min(10, 'Provide a short reason (min 10 chars)').max(500)
});

export const listOrdersQuerySchema = z.object({
  status: z
    .enum(['pending', 'processing', 'succeeded', 'failed', 'refunded'])
    .optional(),
  provider: z.enum(['telebirr', 'cbe_birr', 'chapa', 'manual']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25)
});

export const refundSchema = z.object({
  amount: z.number().int().min(1).optional(),
  reason: z.string().trim().min(10, 'Provide a short reason (min 10 chars)').max(500)
});

export const listFlagsQuerySchema = z.object({
  status: z.enum(['open', 'resolved', 'dismissed']).optional()
});

export const resolveFlagSchema = z.object({
  resolution: z.enum(['unpublish', 'delete', 'keep']),
  reason: z.string().trim().min(10, 'Provide a short reason (min 10 chars)').max(500)
});

export const listAuditQuerySchema = z.object({
  actorId: z.string().optional(),
  action: z.string().trim().optional(),
  resourceType: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50)
});
