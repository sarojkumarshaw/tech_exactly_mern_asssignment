export class ApiError extends Error {
  constructor(statusCode, message, details = null, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.errorCode = errorCode || this.getDefaultErrorCode(statusCode);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  getDefaultErrorCode(statusCode) {
    switch (statusCode) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'UNPROCESSABLE_ENTITY';
      case 429: return 'TOO_MANY_REQUESTS';
      default: return 'INTERNAL_SERVER_ERROR';
    }
  }

  static badRequest(message = 'Bad Request', details = null, errorCode = 'BAD_REQUEST') {
    return new ApiError(400, message, details, errorCode);
  }

  static unauthorized(message = 'Unauthorized access', details = null, errorCode = 'UNAUTHORIZED') {
    return new ApiError(401, message, details, errorCode);
  }

  static forbidden(message = 'Forbidden resource', details = null, errorCode = 'FORBIDDEN') {
    return new ApiError(403, message, details, errorCode);
  }

  static notFound(message = 'Resource not found', details = null, errorCode = 'NOT_FOUND') {
    return new ApiError(404, message, details, errorCode);
  }

  static conflict(message = 'Resource conflict', details = null, errorCode = 'CONFLICT') {
    return new ApiError(409, message, details, errorCode);
  }

  static unprocessableEntity(message = 'Validation failed', details = null) {
    return new ApiError(422, message, details, 'VALIDATION_ERROR');
  }

  static internal(message = 'Internal server error', details = null) {
    return new ApiError(500, message, details, 'INTERNAL_SERVER_ERROR');
  }
}
