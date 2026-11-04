import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  changeUserRole,
  toggleUserStatus,
  deleteUser,
  getAdminPosts,
  getActivityLogs,
  getErrorLogs
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  changeUserRoleSchema,
  toggleUserStatusSchema,
  userIdParamSchema
} from '../validations/user.validation.js';

const router = Router();

// Protect ALL admin routes with Auth + Admin RBAC
router.use(authenticate, authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', validate(changeUserRoleSchema), changeUserRole);
router.patch('/users/:id/status', validate(toggleUserStatusSchema), toggleUserStatus);
router.delete('/users/:id', validate(userIdParamSchema), deleteUser);
router.get('/posts', getAdminPosts);
router.get('/logs/activity', getActivityLogs);
router.get('/logs/error', getErrorLogs);

export default router;
