import { ApiError } from '../utils/apiError.js';
import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';

/**
 * Restrict endpoint to specific roles (e.g. 'admin')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Access denied. Role '${req.user.role}' is not authorized to access this resource.`)
      );
    }

    next();
  };
};

/**
 * Check if the authenticated user is the author of the post or an admin
 */
export const checkPostOwnershipOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return next(ApiError.notFound('Post not found'));
    }

    // Admins can manage all posts
    if (req.user.role === 'admin') {
      req.targetPost = post;
      return next();
    }

    // Regular users can only manage their own active posts
    if (post.author.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You are only authorized to modify or delete your own posts'));
    }

    req.targetPost = post;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if the authenticated user is the author of the comment or an admin
 */
export const checkCommentOwnershipOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return next(ApiError.notFound('Comment not found'));
    }

    // Admins can manage all comments
    if (req.user.role === 'admin') {
      req.targetComment = comment;
      return next();
    }

    // Regular users can only modify/delete their own comments
    if (comment.author.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You are only authorized to modify or delete your own comments'));
    }

    req.targetComment = comment;
    next();
  } catch (error) {
    next(error);
  }
};

