import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    avatar: z.string().url('Must be a valid URL').optional().or(z.literal(''))
  })
});

export const changeUserRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID')
  }),
  body: z.object({
    role: z.enum(['user', 'admin'], {
      required_error: 'Role must be either user or admin'
    })
  })
});

export const toggleUserStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID')
  }),
  body: z.object({
    isActive: z.boolean({
      required_error: 'isActive flag is required'
    })
  })
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID')
  })
});

