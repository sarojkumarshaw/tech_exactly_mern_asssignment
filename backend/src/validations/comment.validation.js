import { z } from 'zod';

export const createCommentSchema = z.object({
  params: z.object({
    postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Post ID')
  }),
  body: z.object({
    content: z.string().trim().min(1, 'Comment cannot be empty').max(1000, 'Comment cannot exceed 1000 characters')
  })
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Comment ID')
  }),
  body: z.object({
    content: z.string().trim().min(1, 'Comment cannot be empty').max(1000, 'Comment cannot exceed 1000 characters')
  })
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Comment ID')
  })
});
