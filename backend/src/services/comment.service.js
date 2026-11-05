import { Comment } from '../models/comment.model.js';
import { Post } from '../models/post.model.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../middleware/activityLogger.middleware.js';
import { getSocketIO } from '../sockets/socket.js';
import { NotificationService } from './notification.service.js';

export class CommentService {
  /**
   * Add a comment to a post
   */
  static async createComment({ postId, authorUser, content }, req) {
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      throw ApiError.notFound('Post not found or has been deleted');
    }

    const comment = await Comment.create({
      post: postId,
      author: authorUser._id,
      content
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar role')
      .lean();

    // Log user activity
    await logActivity({
      req,
      action: 'COMMENT_CREATE',
      entityType: 'COMMENT',
      entityId: comment._id,
      details: { postId, postTitle: post.title }
    });

    // Real-time notification to post author and commenter (Persisted to MongoDB)
    try {
      // 1. Persist notification to MongoDB & emit to post author
      await NotificationService.createNotification({
        recipient: post.author,
        sender: authorUser._id,
        type: 'COMMENT_ON_POST',
        title: 'New Comment on Your Article',
        message: `${authorUser.name} commented on your post "${post.title}"`,
        postId: post._id,
        slug: post.slug,
        link: `/posts/${post.slug}`
      });

      const io = getSocketIO();
      if (io) {
        // Broadcast new comment to anyone viewing this post room
        io.to(`post_${postId}`).emit('new_comment', populatedComment);

        // Also emit notification to commenter if different, so both users experience real-time push feedback
        if (authorUser._id.toString() !== post.author.toString()) {
          io.to(`user_${authorUser._id.toString()}`).emit('notification', {
            type: 'COMMENT_POSTED',
            title: 'Comment Published',
            message: `Your comment was posted on "${post.title}"`,
            postId: post._id,
            slug: post.slug,
            commentId: comment._id,
            createdAt: comment.createdAt
          });
        }
      }
    } catch {
      // Socket / Notification optional
    }

    return populatedComment;
  }

  /**
   * Get all comments for a post
   */
  static async getCommentsByPost(postId) {
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      throw ApiError.notFound('Post not found');
    }

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: -1 })
      .lean();

    return comments;
  }

  /**
   * Update comment content (Only author)
   */
  static async updateComment(id, content, currentUser, req) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    // RBAC: Only comment author can edit comment content
    if (comment.author.toString() !== currentUser._id.toString()) {
      throw ApiError.forbidden('You can only edit your own comments');
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    const updated = await Comment.findById(comment._id)
      .populate('author', 'name email avatar role')
      .lean();

    await logActivity({
      req,
      action: 'COMMENT_UPDATE',
      entityType: 'COMMENT',
      entityId: comment._id,
      details: { postId: comment.post }
    });

    return updated;
  }

  /**
   * Delete comment (Author or Admin)
   */
  static async deleteComment(id, currentUser, req) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    // RBAC: Author can delete own comment, Admin can delete ANY comment
    if (currentUser.role !== 'admin' && comment.author.toString() !== currentUser._id.toString()) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    await Comment.findByIdAndDelete(id);

    await logActivity({
      req,
      action: 'COMMENT_DELETE',
      entityType: 'COMMENT',
      entityId: id,
      details: { postId: comment.post, deletedBy: currentUser.role }
    });

    // Notify room of comment deletion
    try {
      const io = getSocketIO();
      if (io) {
        io.to(`post_${comment.post}`).emit('delete_comment', { commentId: id });
      }
    } catch {
      // Socket optional
    }

    return { message: 'Comment deleted successfully' };
  }
}

