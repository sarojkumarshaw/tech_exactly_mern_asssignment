import { Router } from 'express';
import { getProfile, updateProfile, getMyPosts } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateUserProfileSchema, userIdParamSchema } from '../validations/user.validation.js';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateUserProfileSchema), updateProfile);
router.get('/my-posts', authenticate, getMyPosts);
router.get('/:id', validate(userIdParamSchema), getProfile);

export default router;
