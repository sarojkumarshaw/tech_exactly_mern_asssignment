import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
});

export const socialLoginSchema = z.object({
  body: z.object({
    provider: z.enum(['google', 'facebook']),
    token: z.string().min(1, 'OAuth token is required'),
    email: z.string().email().optional(),
    name: z.string().optional(),
    avatar: z.string().optional()
  })
});
