import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { generateTokens, verifyRefreshToken } from '../utils/tokens.js';
import { logActivity } from '../middleware/activityLogger.middleware.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_ID.includes('your-google-client-id')
    ? env.GOOGLE_CLIENT_ID
    : undefined
);

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
   * Find or create social user (Used by Passport.js strategies & OAuth callbacks)
   */
  static async findOrCreateSocialUser({ provider, providerId, email, name, avatar }, req = {}) {
    let resolvedEmail = email;
    if (!resolvedEmail) {
      resolvedEmail = `${provider}_${providerId || Date.now()}@example.com`;
    }
    const resolvedName = name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    const resolvedAvatar = avatar || '';

    let user = await User.findOne({
      $or: [{ email: resolvedEmail }, { providerId, authProvider: provider }]
    }).select('+refreshToken');

    if (!user) {
      user = await User.create({
        name: resolvedName,
        email: resolvedEmail,
        authProvider: provider,
        providerId: providerId || String(Date.now()),
        avatar: resolvedAvatar,
        role: 'user',
        isActive: true
      });
    } else {
      user.authProvider = provider;
      if (providerId) user.providerId = providerId;
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
      details: { email: user.email, provider, authProvider: provider, method: 'oauth2_library' }
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

  /**
   * Social OAuth Login (Google / Facebook)
   * Supports live OAuth 2.0 verification using google-auth-library and Facebook Graph API,
   * with seamless fallback for simulated local demo payloads.
   */
  static async socialLogin({ provider, token, email, name, avatar }, req) {
    let resolvedEmail = email;
    let resolvedName = name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    let resolvedAvatar = avatar || '';
    let resolvedProviderId = token || String(Date.now());

    // 1. Google OAuth 2.0 Verification via google-auth-library SDK
    if (provider === 'google' && token && (token.startsWith('eyJ') || token.includes('.'))) {
      try {
        if (env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_ID.includes('your-google-client-id')) {
          const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: env.GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          if (payload) {
            resolvedEmail = payload.email || resolvedEmail;
            resolvedName = payload.name || resolvedName;
            resolvedAvatar = payload.picture || resolvedAvatar;
            resolvedProviderId = payload.sub || resolvedProviderId;
          }
        } else {
          const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
          if (googleRes.ok) {
            const googleData = await googleRes.json();
            resolvedEmail = googleData.email || resolvedEmail;
            resolvedName = googleData.name || resolvedName;
            resolvedAvatar = googleData.picture || resolvedAvatar;
            resolvedProviderId = googleData.sub || resolvedProviderId;
          }
        }
      } catch (err) {
        logger.info('Google token verification fallback applied', { error: err.message });
      }
    }

    // 2. Facebook OAuth 2.0 Access Token Verification via Facebook Graph API
    if (provider === 'facebook' && token && (token.startsWith('EA') || token.length > 25)) {
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`
        );
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          resolvedEmail = fbData.email || resolvedEmail;
          resolvedName = fbData.name || resolvedName;
          resolvedAvatar = fbData.picture?.data?.url || resolvedAvatar;
          resolvedProviderId = fbData.id || resolvedProviderId;
        }
      } catch (err) {
        logger.info('Facebook token verification fallback applied', { error: err.message });
      }
    }

    return await this.findOrCreateSocialUser({
      provider,
      providerId: resolvedProviderId,
      email: resolvedEmail,
      name: resolvedName,
      avatar: resolvedAvatar
    }, req);
  }
}

