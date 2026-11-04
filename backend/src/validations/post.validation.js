import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
    content: z.string().trim().min(10, 'Content must be at least 10 characters'),
    excerpt: z.string().trim().max(300, 'Excerpt cannot exceed 300 characters').optional(),
    category: z.string().trim().max(50).optional(),
    tags: z.array(z.string().trim()).optional().default([]),
    coverImage: z.string().url('Must be a valid URL').optional().or(z.literal(''))
  })
});

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Post ID')
  }),
  body: z.object({
    title: z.string().trim().min(3).max(200).optional(),
    content: z.string().trim().min(10).optional(),
    excerpt: z.string().trim().max(300).optional(),
    category: z.string().trim().max(50).optional(),
    tags: z.array(z.string().trim()).optional(),
    coverImage: z.string().url().optional().or(z.literal(''))
  })
});

export const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    tag: z.string().trim().optional(),
    author: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Author ID').optional(),
    includeDeleted: z.enum(['true', 'false']).optional().default('false')
  }).optional()
});

export const postSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Slug is required')
  })
});

export const postIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Post ID')
  })
});
