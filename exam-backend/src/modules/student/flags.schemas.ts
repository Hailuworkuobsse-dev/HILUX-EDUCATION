import { z } from 'zod';

export const createFlagSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  reason: z
    .string()
    .trim()
    .min(3, 'Reason must be at least 3 characters')
    .max(120, 'Reason is too long'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long')
});
export type CreateFlagInput = z.infer<typeof createFlagSchema>;
