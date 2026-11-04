import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';
import { ActivityLog } from '../models/activityLog.model.js';
import { ErrorLog } from '../models/errorLog.model.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../middleware/activityLogger.middleware.js';

export class AdminService {
  /**
   * Admin dashboard metrics
   */
  static async getDashboardStats() {
    const [
      totalUsers,
      totalPosts,
      activePosts,
      softDeletedPosts,
      totalComments,
      recentActivities,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(), // all posts
      Post.countDocuments({ isDeleted: false }),
      Post.countDocuments({ isDeleted: true }),
      Comment.countDocuments(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10).lean(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password').lean()
    ]);

    return {
      stats: {
        totalUsers,
        totalPosts,
        activePosts,
        softDeletedPosts,
        totalComments
      },
      recentActivities,
      recentUsers
    };
  }

  /**
   * Manage users: List with search & filters
   */
  static async getAllUsers({ page = 1, limit = 10, role, isActive, search }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, totalDocs] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    return {
      docs: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  /**
   * Change user role (user <-> admin)
   */
  static async changeUserRole(userId, newRole, adminUser, req) {
    if (userId === adminUser._id.toString()) {
      throw ApiError.badRequest('You cannot modify your own administrator role');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    await logActivity({
      req,
      action: 'USER_ROLE_CHANGE',
      entityType: 'USER',
      entityId: user._id,
      details: { oldRole, newRole, targetEmail: user.email }
    });

    return user;
  }

  /**
   * Toggle user active status (suspend/activate)
   */
  static async toggleUserStatus(userId, isActive, adminUser, req) {
    if (userId === adminUser._id.toString()) {
      throw ApiError.badRequest('You cannot deactivate your own account');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.isActive = isActive;
    // Invalidate refresh token if deactivated
    if (!isActive) {
      user.refreshToken = null;
    }
    await user.save();

    await logActivity({
      req,
      action: 'USER_STATUS_CHANGE',
      entityType: 'USER',
      entityId: user._id,
      details: { isActive, targetEmail: user.email }
    });

    return user;
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(userId, adminUser, req) {
    if (userId === adminUser._id.toString()) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Soft-delete or remove user's posts & comments
    await Post.updateMany({ author: userId }, { isDeleted: true, deletedAt: new Date() });
    await Comment.deleteMany({ author: userId });
    await User.findByIdAndDelete(userId);

    await logActivity({
      req,
      action: 'ADMIN_ACTION',
      entityType: 'USER',
      entityId: userId,
      details: { action: 'DELETE_USER', targetEmail: user.email }
    });

    return { message: 'User and associated content removed successfully' };
  }

  /**
   * View all posts for Admin (including soft-deleted)
   */
  static async getAdminPosts({ page = 1, limit = 10, status, search }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status === 'deleted') {
      query.isDeleted = true;
    } else if (status === 'active') {
      query.isDeleted = false;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const [posts, totalDocs] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    return {
      docs: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  /**
   * Get activity logs for audit
   */
  static async getActivityLogs({ page = 1, limit = 20, action, entityType }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const [logs, totalDocs] = await Promise.all([
      ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ActivityLog.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    return {
      docs: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  /**
   * Get error logs for audit
   */
  static async getErrorLogs({ page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, totalDocs] = await Promise.all([
      ErrorLog.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ErrorLog.countDocuments()
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    return {
      docs: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }
}
