import { CommentService } from '../services/comment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const comment = await CommentService.createComment(
    {
      postId,
      authorUser: req.user,
      content
    },
    req
  );

  return ApiResponse.created(res, 'Comment posted successfully', comment);
});

export const getCommentsByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const comments = await CommentService.getCommentsByPost(postId);
  return ApiResponse.success(res, 200, 'Comments fetched successfully', comments);
});

export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const updatedComment = await CommentService.updateComment(id, content, req.user, req);
  return ApiResponse.success(res, 200, 'Comment updated successfully', updatedComment);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await CommentService.deleteComment(id, req.user, req);
  return ApiResponse.success(res, 200, result.message);
});
