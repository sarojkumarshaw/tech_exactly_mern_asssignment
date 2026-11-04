import { ActivityLog } from '../models/activityLog.model.js';
import { activityLoggerInstance, logger } from '../config/logger.js';
import { getSocketIO } from '../sockets/socket.js';

export const logActivity = async ({
  req,
  action,
  entityType = 'SYSTEM',
  entityId = null,
  statusCode = 200,
  details = {}
}) => {
  try {
    const user = req?.user || null;
    const ip = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip || '127.0.0.1';
    const userAgent = req?.headers?.['user-agent'] || 'Unknown';
    const requestId = req?.requestId || resLocalRequestId(req);

    const logEntry = {
      userId: user?._id || null,
      userEmail: user?.email || 'anonymous',
      role: user?.role || 'guest',
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      method: req?.method || 'N/A',
      endpoint: req?.originalUrl || req?.url || 'N/A',
      ip: typeof ip === 'string' ? ip : String(ip),
      userAgent,
      statusCode,
      requestId,
      details
    };

    // 1. Winston activity log
    activityLoggerInstance.info(`[${action}] ${entityType}`, logEntry);

    // 2. Persist to MongoDB
    const savedLog = await ActivityLog.create(logEntry);

    // 3. Emit real-time notification to admin socket room if socket is available
    try {
      const io = getSocketIO();
      if (io) {
        io.to('admin_room').emit('activity_log', savedLog);
      }
    } catch {
      // Socket not yet initialized or disconnected
    }

    return savedLog;
  } catch (error) {
    logger.error('Failed to log activity:', { error: error.message });
  }
};

const resLocalRequestId = (req) => {
  return req?.res?.locals?.requestId || req?.requestId || '';
};

/**
 * Reusable Express route middleware to log specific activities
 */
export const recordActivity = (action, entityType = 'SYSTEM') => {
  return (req, res, next) => {
    // Capture the original res.send/json to log upon successful completion
    const originalJson = res.json;

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const entityId = data?.data?._id || req.params?.id || null;
        logActivity({
          req,
          action,
          entityType,
          entityId,
          statusCode: res.statusCode,
          details: {
            title: req.body?.title,
            slug: data?.data?.slug,
            params: req.params
          }
        }).catch((err) => logger.error('Error in recordActivity hook:', err));
      }
      return originalJson.call(this, data);
    };

    next();
  };
};
