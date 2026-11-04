import { ApiError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';
import { ErrorLog } from '../models/errorLog.model.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot find endpoint [${req.method}] ${req.originalUrl}`));
};

export const errorHandler = async (err, req, res, next) => {
  let error = err;

  // Convert known external/framework errors into ApiError
  if (!(error instanceof ApiError)) {
    // MongoDB CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
      error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`, null, 'INVALID_ID');
    }
    // MongoDB Duplicate Key Error (E11000)
    else if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
      error = ApiError.conflict(
        `Duplicate value entered for ${duplicateField}. Please choose another.`,
        err.keyValue,
        'DUPLICATE_FIELD'
      );
    }
    // Mongoose Validation Error
    else if (err.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e) => ({
        field: e.path,
        message: e.message
      }));
      error = ApiError.unprocessableEntity('Database validation failed', details);
    }
    // JWT Errors
    else if (err.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid security token. Please log in again.');
    } else if (err.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Your security token has expired. Please refresh or log in again.');
    }
    // Default to Internal 500
    else {
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      error = new ApiError(statusCode, message, null, 'INTERNAL_SERVER_ERROR');
      error.stack = err.stack;
    }
  }

  const statusCode = error.statusCode || 500;
  const requestId = req?.requestId || res.locals?.requestId || null;

  // Prepare detailed log payload
  const logPayload = {
    service: env.SERVICE_NAME,
    environment: env.NODE_ENV,
    statusCode,
    errorCode: error.errorCode,
    message: error.message,
    details: error.details,
    stack: error.stack,
    endpoint: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection?.remoteAddress,
    userId: req.user?._id || null,
    requestId,
    params: req.params,
    query: req.query,
    body: sanitizeSensitive(req.body)
  };

  // 1. Winston logging
  if (statusCode >= 500) {
    logger.error(`[${error.errorCode}] ${error.message}`, logPayload);
  } else {
    logger.warn(`[${error.errorCode}] ${error.message}`, {
      statusCode,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      requestId
    });
  }

  // 2. Database error logging for 5xx errors or operational crashes
  if (env.LOG_TO_DB && statusCode >= 500) {
    ErrorLog.create({
      service: env.SERVICE_NAME,
      environment: env.NODE_ENV,
      statusCode,
      errorCode: error.errorCode,
      message: error.message,
      stack: error.stack,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip || '127.0.0.1',
      userId: req.user?._id || null,
      requestId,
      metadata: {
        details: error.details,
        query: req.query,
        params: req.params
      }
    }).catch((dbErr) => logger.error('Failed to write error log to MongoDB:', dbErr));
  }

  // 3. Consistent Client Response
  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: {
      code: error.errorCode,
      message: error.message,
      details: error.details
    },
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
    ...(env.NODE_ENV === 'development' && statusCode >= 500 && { stack: error.stack })
  });
};

const sanitizeSensitive = (body) => {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };
  if (clone.password) clone.password = '***REDACTED***';
  if (clone.refreshToken) clone.refreshToken = '***REDACTED***';
  return clone;
};

