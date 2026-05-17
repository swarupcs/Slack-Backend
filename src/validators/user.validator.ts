import { z } from 'zod';

export const userSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(
      /^[a-zA-Z0-9]+$/,
      'Username must contain only letters and numbers'
    ),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const userSignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type UserSignUpInput = z.infer<typeof userSignUpSchema>;
export type UserSignInInput = z.infer<typeof userSignInSchema>;
