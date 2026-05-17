import { z } from 'zod';

export const editMessageSchema = z.object({
  body: z.object({
    body: z.string().min(1, 'Message body cannot be empty')
  })
});

export const toggleReactionSchema = z.object({
  body: z.object({
    emoji: z.string().min(1, 'Emoji string is required')
  })
});
