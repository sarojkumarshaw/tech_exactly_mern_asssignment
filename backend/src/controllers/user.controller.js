import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getProfile(req.params.id || req.user._id);
  return ApiResponse.success(res, 200, 'User profile retrieved', user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateProfile(req.user._id, req.body, req);
  return ApiResponse.success(res, 200, 'Profile updated successfully', updatedUser);
});

export const getMyPosts = asyncHandler(async (req, res) => {
  const { page, limit, includeDeleted } = req.query;
  const result = await UserService.getUserPosts(req.user._id, {
    page,
    limit,
    includeDeleted: includeDeleted ?? 'true'
  });

  return ApiResponse.paginated(res, 'User posts retrieved successfully', result.docs, result.pagination);
});

