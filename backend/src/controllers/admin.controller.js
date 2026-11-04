import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSocketIO } from '../sockets/socket.js';

export const broadcastAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const io = getSocketIO();
  if (io) {
    io.emit('broadcast_announcement', {
      id: Date.now(),
      title: title || 'System Announcement',
      message: message || 'Live real-time announcement from the Administrator',
      sender: req.user?.name || 'Administrator',
      createdAt: new Date().toISOString()
    });
  }
  return ApiResponse.success(res, 200, 'Announcement broadcasted in real-time');
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await AdminService.getDashboardStats();
  return ApiResponse.success(res, 200, 'Admin metrics retrieved', data);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, isActive, search } = req.query;
  const result = await AdminService.getAllUsers({ page, limit, role, isActive, search });
  return ApiResponse.paginated(res, 'Users fetched successfully', result.docs, result.pagination);
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const updatedUser = await AdminService.changeUserRole(id, role, req.user, req);
  return ApiResponse.success(res, 200, `User role changed to ${role}`, updatedUser);
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const updatedUser = await AdminService.toggleUserStatus(id, isActive, req.user, req);
  return ApiResponse.success(
    res,
    200,
    `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    updatedUser
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.deleteUser(id, req.user, req);
  return ApiResponse.success(res, 200, result.message);
});

export const getAdminPosts = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;
  const result = await AdminService.getAdminPosts({ page, limit, status, search });
  return ApiResponse.paginated(res, 'Admin posts fetched successfully', result.docs, result.pagination);
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page, limit, action, entityType } = req.query;
  const result = await AdminService.getActivityLogs({ page, limit, action, entityType });
  return ApiResponse.paginated(res, 'Activity logs fetched successfully', result.docs, result.pagination);
});

export const getErrorLogs = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await AdminService.getErrorLogs({ page, limit });
  return ApiResponse.paginated(res, 'Error logs fetched successfully', result.docs, result.pagination);
});

