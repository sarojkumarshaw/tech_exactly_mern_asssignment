import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  softDeletePost,
  restorePost,
  hardDeletePost
} from '../controllers/post.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles, checkPostOwnershipOrAdmin } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  postSlugParamSchema,
  postIdParamSchema
} from '../validations/post.validation.js';

const router = Router();

// Public routes (with optional auth to contextually permit authors/admins)
router.get('/', optionalAuth, validate(getPostsQuerySchema), getAllPosts);
router.get('/:slug', optionalAuth, validate(postSlugParamSchema), getPostBySlug);
router.get('/id/:id', optionalAuth, validate(postIdParamSchema), getPostById);

// Protected routes (RBAC enforced)
router.post('/', authenticate, validate(createPostSchema), createPost);
router.put('/:id', authenticate, checkPostOwnershipOrAdmin, validate(updatePostSchema), updatePost);
router.delete('/:id', authenticate, checkPostOwnershipOrAdmin, validate(postIdParamSchema), softDeletePost);
router.patch('/:id/restore', authenticate, checkPostOwnershipOrAdmin, validate(postIdParamSchema), restorePost);
router.delete('/:id/permanent', authenticate, authorizeRoles('admin'), validate(postIdParamSchema), hardDeletePost);

export default router;
