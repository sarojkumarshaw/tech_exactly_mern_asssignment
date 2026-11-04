import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body, req);

  // Set HTTP-only refresh token cookie for security
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return ApiResponse.created(res, 'Registration successful', result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body, req);

  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return ApiResponse.success(res, 200, 'Login successful', result);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const newTokens = await AuthService.refreshTokens(token);

  res.cookie('refreshToken', newTokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return ApiResponse.success(res, 200, 'Tokens refreshed successfully', {
    tokens: newTokens
  });
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  await AuthService.logout(userId, req);

  res.clearCookie('refreshToken');
  return ApiResponse.success(res, 200, 'Logged out successfully');
});

export const socialLogin = asyncHandler(async (req, res) => {
  const result = await AuthService.socialLogin(req.body, req);

  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return ApiResponse.success(res, 200, 'Social authentication successful', result);
});

export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 200, 'User profile retrieved', {
    user: req.user
  });
});

