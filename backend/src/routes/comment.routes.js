import { Router } from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkCommentOwnershipOrAdmin } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema
} from '../validations/comment.validation.js';

const router = Router();

// Public route to view comments
router.get('/post/:postId', getCommentsByPost);

// Protected routes (RBAC enforced)
router.post('/post/:postId', authenticate, validate(createCommentSchema), createComment);
router.put('/:id', authenticate, checkCommentOwnershipOrAdmin, validate(updateCommentSchema), updateComment);
router.delete('/:id', authenticate, checkCommentOwnershipOrAdmin, validate(commentIdParamSchema), deleteComment);

export default router;

