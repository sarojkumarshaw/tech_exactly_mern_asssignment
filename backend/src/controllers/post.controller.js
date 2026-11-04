import { PostService } from '../services/post.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await PostService.createPost(req.body, req.user, req);
  return ApiResponse.created(res, 'Post created successfully', post);
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const { page, limit, search, category, tag, author, includeDeleted } = req.query;
  const result = await PostService.getAllPosts({
    page,
    limit,
    search,
    category,
    tag,
    author,
    includeDeleted,
    currentUser: req.user
  });

  return ApiResponse.paginated(res, 'Posts fetched successfully', result.docs, result.pagination);
});

export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const post = await PostService.getPostBySlug(slug, req.user);
  return ApiResponse.success(res, 200, 'Post retrieved successfully', post);
});

export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await PostService.getPostById(id, req.user);
  return ApiResponse.success(res, 200, 'Post retrieved successfully', post);
});

export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedPost = await PostService.updatePost(id, req.body, req.user, req);
  return ApiResponse.success(res, 200, 'Post updated successfully', updatedPost);
});

export const softDeletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await PostService.softDeletePost(id, req.user, req);
  return ApiResponse.success(res, 200, result.message, { id: result.id });
});

export const restorePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await PostService.restorePost(id, req.user, req);
  return ApiResponse.success(res, 200, result.message, result.post);
});

export const hardDeletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await PostService.hardDeletePost(id, req.user, req);
  return ApiResponse.success(res, 200, result.message);
});

