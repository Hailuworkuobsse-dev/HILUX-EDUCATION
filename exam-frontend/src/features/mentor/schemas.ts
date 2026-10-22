import { z } from 'zod';

export const messageSchema = z.object({
  body: z.string().trim().min(1, 'Message is required').max(2000, 'Message is too long')
});
export type MessageInput = z.infer<typeof messageSchema>;

export const mentorProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  subjects: z.array(z.string()).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  languages: z.array(z.string()).optional(),
  availability: z.enum(['available', 'busy', 'offline']).optional()
});
export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;
