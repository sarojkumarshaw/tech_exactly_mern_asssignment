import { verifyAccessToken } from '../utils/tokens.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is missing. Please log in.'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Access token has expired. Please refresh your token.', null, 'TOKEN_EXPIRED'));
      }
      return next(new ApiError(401, 'Invalid authentication token.', null, 'INVALID_TOKEN'));
    }

    const user = await User.findById(decoded.sub).select('+role +isActive');
    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated. Please contact support.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select('+role +isActive');
      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

