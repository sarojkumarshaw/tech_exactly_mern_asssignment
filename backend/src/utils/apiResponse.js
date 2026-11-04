export class ApiResponse {
  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const responsePayload = {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      responsePayload.meta = meta;
    }

    if (res.locals?.requestId) {
      responsePayload.requestId = res.locals.requestId;
    }

    return res.status(statusCode).json(responsePayload);
  }

  static created(res, message = 'Resource created successfully', data = null, meta = null) {
    return ApiResponse.success(res, 201, message, data, meta);
  }

  static paginated(res, message = 'Data fetched successfully', docs = [], pagination = {}) {
    return ApiResponse.success(res, 200, message, docs, {
      page: pagination.page,
      limit: pagination.limit,
      totalDocs: pagination.totalDocs,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage
    });
  }
}

