import { z } from 'zod';

const practiceConfigSchema = z.object({
  subjectId: z.string().min(1),
  topicIds: z.array(z.string()),
  questionCount: z.number().int().min(1).max(100),
  mode: z.enum(['custom', 'spaced'])
});

export const startAttemptSchema = z
  .object({
    paperId: z.string().min(1).optional(),
    practice: practiceConfigSchema.optional()
  })
  .refine((v) => !!(v.paperId || v.practice), {
    message: 'Either paperId or practice must be provided'
  });
export type StartAttemptInput = z.infer<typeof startAttemptSchema>;

export const saveAnswerSchema = z.object({
  selectedOptionId: z.string().nullable()
});
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;

export const listAttemptsQuerySchema = z.object({
  status: z.enum(['in_progress', 'graded']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  page: z.coerce.number().int().min(1).optional()
});
export type ListAttemptsQuery = z.infer<typeof listAttemptsQuerySchema>;
