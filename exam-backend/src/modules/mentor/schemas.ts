import { z } from 'zod';

export const listMenteesQuerySchema = z.object({
  search: z.string().trim().optional(),
  risk: z.enum(['all', 'low', 'medium', 'high']).optional()
});

export const listReportsQuerySchema = z.object({
  status: z.enum(['open', 'resolved', 'dismissed']).optional()
});

export const listMessagesQuerySchema = z.object({
  since: z
    .string()
    .optional()
    .refine((s) => s === undefined || !Number.isNaN(Date.parse(s)), {
      message: 'Invalid ISO date'
    })
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, 'Message is required').max(2000, 'Message is too long')
});

export const updateReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed'], {
    errorMap: () => ({ message: 'Status must be resolved or dismissed' })
  })
});

export const updateProfileSchema = z.object({
  bio: z.string().trim().max(500).optional(),
  subjects: z.array(z.string()).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  languages: z.array(z.string()).optional(),
  availability: z.enum(['available', 'busy', 'offline']).optional()
});
