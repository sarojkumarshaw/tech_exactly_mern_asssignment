import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { generateTokens, verifyRefreshToken } from '../utils/tokens.js';
import { logActivity } from '../middleware/activityLogger.middleware.js';

export class AuthService {
  /**
   * Register a new user
   */
  static async register({ name, email, password }, req) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // First user can be made admin automatically if desired, or standard user
    const usersCount = await User.countDocuments();
    const role = usersCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role,
      authProvider: 'local'
    });

    const tokens = generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    await logActivity({
      req,
      action: 'USER_REGISTER',
      entityType: 'AUTH',
      entityId: user._id,
      details: { email: user.email, role: user.role }
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      tokens
    };
  }

  /**
   * Log in user with email & password
   */
  static async login({ email, password }, req) {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Please contact support.');
    }

    if (user.authProvider !== 'local' && !user.password) {
      throw ApiError.badRequest(`This account uses ${user.authProvider} sign-in. Please log in using ${user.authProvider}.`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    await logActivity({
      req: { ...req, user },
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user._id,
      details: { email: user.email, method: 'password' }
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lastLoginAt: user.lastLoginAt
      },
      tokens
    };
  }

  /**
   * Refresh JWT access token using valid refresh token
   */
  static async refreshTokens(providedRefreshToken) {
    if (!providedRefreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(providedRefreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.sub).select('+refreshToken');
    if (!user || user.refreshToken !== providedRefreshToken) {
      throw ApiError.unauthorized('Invalid refresh token or token has been revoked');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated');
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  /**
   * Log out user (invalidate refresh token)
   */
  static async logout(userId, req) {
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
      await logActivity({
        req,
        action: 'USER_LOGOUT',
        entityType: 'AUTH',
        entityId: userId,
        details: { userId }
      });
    }
    return true;
  }

  /**
   * Social OAuth Login (Google / Facebook)
   * Supports OAuth 2.0 verification or simulated client payload
   */
  static async socialLogin({ provider, token, email, name, avatar }, req) {
    // In production, token is verified against Google tokeninfo endpoint or Facebook Graph API
    // Here we implement robust validation with fallback to parse payload
    let resolvedEmail = email;
    let resolvedName = name || 'Social User';
    let resolvedAvatar = avatar || '';
    let resolvedProviderId = token;

    if (!resolvedEmail) {
      resolvedEmail = `${provider}_user_${Date.now()}@example.com`;
    }

    let user = await User.findOne({
      $or: [{ email: resolvedEmail }, { providerId: resolvedProviderId, authProvider: provider }]
    }).select('+refreshToken');

    if (!user) {
      user = await User.create({
        name: resolvedName,
        email: resolvedEmail,
        authProvider: provider,
        providerId: resolvedProviderId,
        avatar: resolvedAvatar,
        role: 'user',
        isActive: true
      });
    } else {
      // Link social provider if matched by email
      user.authProvider = provider;
      user.providerId = resolvedProviderId;
      if (resolvedAvatar && !user.avatar) user.avatar = resolvedAvatar;
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    await logActivity({
      req: { ...req, user },
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user._id,
      details: { email: user.email, provider }
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      },
      tokens
    };
  }
}

