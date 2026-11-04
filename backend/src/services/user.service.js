import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../middleware/activityLogger.middleware.js';

export class UserService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, { name, avatar }, req) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    await logActivity({
      req,
      action: 'USER_PROFILE_UPDATE',
      entityType: 'USER',
      entityId: user._id,
      details: { name: user.name }
    });

    return user;
  }

  /**
   * Get current user's posts (including their own soft-deleted posts with status)
   */
  static async getUserPosts(userId, { page = 1, limit = 10, includeDeleted = 'true' }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = { author: userId };
    if (includeDeleted !== 'true') {
      query.isDeleted = false;
    }

    const [posts, totalDocs] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
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
}
