import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const result = await NotificationService.getUserNotifications(req.user._id, {
    page,
    limit,
    unreadOnly
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Notifications retrieved successfully',
    data: result.docs,
    unreadCount: result.unreadCount,
    pagination: result.pagination,
    timestamp: new Date().toISOString()
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await NotificationService.markAsRead(id, req.user._id);
  return ApiResponse.success(res, 200, 'Notification marked as read', notification);
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await NotificationService.markAllAsRead(req.user._id);
  return ApiResponse.success(res, 200, result.message);
});

export const clearNotifications = asyncHandler(async (req, res) => {
  const result = await NotificationService.clearUserNotifications(req.user._id);
  return ApiResponse.success(res, 200, result.message);
});

