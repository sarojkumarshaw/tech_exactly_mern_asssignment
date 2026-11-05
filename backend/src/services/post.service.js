import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/apiError.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { logActivity } from '../middleware/activityLogger.middleware.js';
import { getSocketIO } from '../sockets/socket.js';
import { NotificationService } from './notification.service.js';

export class PostService {
  /**
   * Create a new blog post
   */
  static async createPost(postData, authorUser, req) {
    const { title, content, excerpt, category, tags, coverImage } = postData;

    const slug = await generateUniqueSlug(title);

    // Auto-generate excerpt if not provided
    const computedExcerpt =
      excerpt ||
      content
        .replace(/<[^>]+>/g, '')
        .slice(0, 180)
        .trim() + (content.length > 180 ? '...' : '');

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: computedExcerpt,
      category: category || 'General',
      tags: tags || [],
      coverImage: coverImage || '',
      author: authorUser._id
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar role')
      .lean();

    // Audit Log
    await logActivity({
      req,
      action: 'POST_CREATE',
      entityType: 'POST',
      entityId: post._id,
      details: { title: post.title, slug: post.slug }
    });

    // Real-time socket notification: Broadcast to all online users
    try {
      const io = getSocketIO();
      if (io) {
        io.emit('new_post', {
          id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          authorName: authorUser.name,
          createdAt: post.createdAt
        });
      }
    } catch {
      // Socket optional
    }

    return populatedPost;
  }

  /**
   * Fetch paginated posts with filters & search
   */
  static async getAllPosts({
    page = 1,
    limit = 10,
    search,
    category,
    tag,
    author,
    includeDeleted = false,
    currentUser = null
  }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Filter by soft-delete status
    const canSeeDeleted = currentUser?.role === 'admin' && includeDeleted === 'true';
    if (!canSeeDeleted) {
      query.isDeleted = false;
    }

    if (category && category !== 'All') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    if (author) {
      query.author = author;
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
   * Get single post by slug
   */
  static async getPostBySlug(slug, currentUser = null) {
    const query = { slug };

    // Regular users cannot see soft-deleted posts
    if (currentUser?.role !== 'admin') {
      query.isDeleted = false;
    }

    const post = await Post.findOne(query)
      .populate('author', 'name email avatar role')
      .populate('commentsCount');

    if (!post) {
      throw ApiError.notFound('Blog post not found');
    }

    // Increment views count asynchronously
    Post.findByIdAndUpdate(post._id, { $inc: { viewsCount: 1 } }).exec();

    return post;
  }

  /**
   * Get single post by ID
   */
  static async getPostById(id, currentUser = null) {
    const post = await Post.findById(id).populate('author', 'name email avatar role');
    if (!post) {
      throw ApiError.notFound('Blog post not found');
    }

    if (post.isDeleted && currentUser?.role !== 'admin') {
      throw ApiError.notFound('Blog post not found');
    }

    return post;
  }

  /**
   * Update blog post (Only author or admin)
   */
  static async updatePost(id, updateData, currentUser, req) {
    const post = await Post.findById(id);
    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    // RBAC: Check ownership unless admin
    if (currentUser.role !== 'admin' && post.author.toString() !== currentUser._id.toString()) {
      throw ApiError.forbidden('You can only edit your own posts');
    }

    if (post.isDeleted && currentUser.role !== 'admin') {
      throw ApiError.badRequest('Cannot update a deleted post');
    }

    const { title, content, excerpt, category, tags, coverImage } = updateData;

    if (title && title !== post.title) {
      post.title = title;
      post.slug = await generateUniqueSlug(title, post._id);
    }

    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) post.tags = tags;
    if (coverImage !== undefined) post.coverImage = coverImage;

    await post.save();

    const updated = await Post.findById(post._id)
      .populate('author', 'name email avatar role')
      .lean();

    await logActivity({
      req,
      action: 'POST_UPDATE',
      entityType: 'POST',
      entityId: post._id,
      details: { title: post.title, slug: post.slug }
    });

    return updated;
  }

  /**
   * Soft delete a post
   */
  static async softDeletePost(id, currentUser, req) {
    const post = await Post.findById(id);
    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    // RBAC: Only author or admin
    if (currentUser.role !== 'admin' && post.author.toString() !== currentUser._id.toString()) {
      throw ApiError.forbidden('You can only delete your own posts');
    }

    if (post.isDeleted) {
      throw ApiError.badRequest('Post is already deleted');
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    await logActivity({
      req,
      action: 'POST_SOFT_DELETE',
      entityType: 'POST',
      entityId: post._id,
      details: { title: post.title, deletedAt: post.deletedAt }
    });

    // Real-time notification: alert author if admin moderated their post (Persisted to MongoDB)
    try {
      if (currentUser.role === 'admin' && post.author.toString() !== currentUser._id.toString()) {
        await NotificationService.createNotification({
          recipient: post.author,
          sender: currentUser._id,
          type: 'POST_MODERATED',
          title: 'Post Moderated',
          message: `An Administrator has soft-deleted your post "${post.title}"`,
          postId: post._id,
          slug: post.slug,
          link: '/notifications'
        });
      }

      const io = getSocketIO();
      if (io) {
        io.emit('post_deleted', { postId: post._id });
      }
    } catch {
      // Socket optional
    }

    return { message: 'Post soft deleted successfully', id: post._id };
  }

  /**
   * Restore a soft-deleted post (Admin or original Author)
   */
  static async restorePost(id, currentUser, req) {
    const post = await Post.findById(id);
    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    if (currentUser.role !== 'admin' && post.author.toString() !== currentUser._id.toString()) {
      throw ApiError.forbidden('You do not have permission to restore this post');
    }

    if (!post.isDeleted) {
      throw ApiError.badRequest('Post is not deleted');
    }

    post.isDeleted = false;
    post.deletedAt = null;
    await post.save();

    await logActivity({
      req,
      action: 'POST_RESTORE',
      entityType: 'POST',
      entityId: post._id,
      details: { title: post.title }
    });

    // Real-time notification: alert author if admin restored their post (Persisted to MongoDB)
    try {
      if (currentUser.role === 'admin' && post.author.toString() !== currentUser._id.toString()) {
        await NotificationService.createNotification({
          recipient: post.author,
          sender: currentUser._id,
          type: 'POST_RESTORED',
          title: 'Post Restored',
          message: `An Administrator has restored your post "${post.title}"`,
          postId: post._id,
          slug: post.slug,
          link: `/posts/${post.slug}`
        });
      }

      const io = getSocketIO();
      if (io) {
        io.emit('post_restored', { postId: post._id });
      }
    } catch {
      // Socket optional
    }

    return { message: 'Post restored successfully', post };
  }

  /**
   * Permanent hard delete (Admin only)
   */
  static async hardDeletePost(id, currentUser, req) {
    if (currentUser.role !== 'admin') {
      throw ApiError.forbidden('Only administrators can permanently delete posts');
    }

    const post = await Post.findById(id);
    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    // Cascade delete associated comments
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    await logActivity({
      req,
      action: 'POST_HARD_DELETE',
      entityType: 'POST',
      entityId: post._id,
      details: { title: post.title }
    });

    return { message: 'Post and associated comments permanently deleted' };
  }
}

