import { z } from 'zod';

export const optionSchema = z.object({
  text: z.string().trim().min(1, 'Option text is required')
});

export const questionFormSchema = z
  .object({
    subjectId: z.string().min(1, 'Pick a subject'),
    topicId: z.string().min(1, 'Pick a topic'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    year: z.preprocess(
      (v) => (v === '' || v === null || Number.isNaN(v) ? undefined : v),
      z.number().int().min(2000).max(2100).optional()
    ),
    language: z.string().min(1, 'Pick a language'),
    prompt: z.string().trim().min(10, 'Prompt must be at least 10 characters'),
    options: z
      .array(optionSchema)
      .min(2, 'At least 2 options')
      .max(5, 'At most 5 options'),
    correctIndex: z.number().int(),
    explanation: z.string().trim().optional()
  })
  .refine((d) => d.correctIndex >= 0 && d.correctIndex < d.options.length, {
    path: ['correctIndex'],
    message: 'Mark the correct answer'
  });
export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const paperFormSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  subjectId: z.string().min(1, 'Pick a subject'),
  year: z.preprocess(
    (v) => (v === '' || v === null || Number.isNaN(v) ? undefined : v),
    z.number().int().min(2000).max(2100)
  ),
  durationMinutes: z.preprocess(
    (v) => (v === '' || v === null || Number.isNaN(v) ? undefined : v),
    z.number().int().min(5, 'Min 5 minutes').max(300, 'Max 300 minutes')
  ),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  language: z.string().min(1, 'Pick a language'),
  description: z.string().trim().optional(),
  questions: z
    .array(
      z.object({
        questionId: z.string(),
        prompt: z.string(),
        difficulty: z.string()
      })
    )
    .min(1, 'Add at least one question')
});
export type PaperFormValues = z.infer<typeof paperFormSchema>;

export const rejectReasonSchema = z.object({
  reason: z.string().trim().min(10, 'Give at least a short reason (min 10 chars)').max(500)
});
export type RejectReasonValues = z.infer<typeof rejectReasonSchema>;
