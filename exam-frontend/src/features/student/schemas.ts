import { z } from 'zod';

export const practiceSetupSchema = z
  .object({
    mode: z.enum(['custom', 'spaced']),
    subjectId: z.string().min(1, 'Pick a subject'),
    topicIds: z.array(z.string()),
    questionCount: z.number().int().min(5).max(100)
  })
  .refine((d) => d.mode === 'spaced' || d.topicIds.length > 0, {
    path: ['topicIds'],
    message: 'Pick at least one topic'
  });
export type PracticeSetupInput = z.infer<typeof practiceSetupSchema>;
