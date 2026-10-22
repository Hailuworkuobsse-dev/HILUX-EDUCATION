import { z } from 'zod';

const difficulty = z.enum(['easy', 'medium', 'hard']);

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

const optionInput = z.object({
  id: z.string().min(1),
  label: z.enum(LABELS),
  text: z.string().trim().min(1, 'Option text is required')
});

export const questionFormSchema = z
  .object({
    subjectId: z.string().min(1, 'Subject is required'),
    topicId: z.string().min(1, 'Topic is required'),
    difficulty,
    year: z
      .number()
      .int()
      .min(2000, 'Year must be 2000–2100')
      .max(2100, 'Year must be 2000–2100')
      .nullable()
      .optional(),
    language: z.string().min(1).max(8).default('en'),
    prompt: z.string().trim().min(10, 'Prompt must be at least 10 characters').max(2000),
    options: z.array(optionInput).min(2, 'At least 2 options').max(5, 'At most 5 options'),
    correctOptionId: z.string().min(1, 'Mark the correct answer'),
    explanation: z.string().trim().max(2000).optional()
  })
  .refine(
    (d) => d.options.some((o) => o.id === d.correctOptionId),
    { path: ['correctOptionId'], message: 'correctOptionId must be one of the options' }
  );
export type QuestionFormInput = z.infer<typeof questionFormSchema>;

export const paperFormSchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(200),
  subjectId: z.string().min(1, 'Subject is required'),
  year: z.number().int().min(2000).max(2100),
  durationMinutes: z.number().int().min(5).max(300),
  difficulty,
  language: z.string().min(1).max(8).default('en'),
  description: z.string().trim().max(2000).optional(),
  questionIds: z.array(z.string().min(1)).min(1, 'Add at least one question').max(200)
});
export type PaperFormInput = z.infer<typeof paperFormSchema>;

export const paperUpdateSchema = paperFormSchema.partial().extend({
  questionIds: z.array(z.string().min(1)).min(1).max(200).optional()
});

export const rejectReasonSchema = z.object({
  reason: z.string().trim().min(10, 'Provide a short reason (min 10 chars)').max(500)
});

export const questionReviewSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    reason: z.string().trim().max(500).optional()
  })
  .refine(
    (d) => d.decision === 'approve' || (d.reason && d.reason.length >= 10),
    { path: ['reason'], message: 'Rejecting requires a reason (min 10 chars)' }
  );
export type QuestionReviewInput = z.infer<typeof questionReviewSchema>;

export const paperListQuerySchema = z.object({
  subjectId: z.string().optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  search: z.string().trim().optional()
});

export const questionListQuerySchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  difficulty: difficulty.optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const reviewQueueKindSchema = z.enum(['questions', 'papers']);

export const importCsvSchema = z.object({
  csv: z.string().min(1, 'CSV is required')
});
