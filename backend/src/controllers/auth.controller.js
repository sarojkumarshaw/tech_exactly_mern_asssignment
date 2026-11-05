import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../config/passport.js';
import { env } from '../config/env.js';
import { generateTokens } from '../utils/tokens.js';

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

/**
 * Initiate Google OAuth 2.0 via Passport.js
 * Redirects user to accounts.google.com for real authentication
 */
export const googleAuth = (req, res, next) => {
  // Only use simulation if explicitly requested via ?demo=true
  if (req.query.demo === 'true') {
    return AuthService.findOrCreateSocialUser(
      {
        provider: 'google',
        providerId: `google_oauth_sub_${Date.now()}`,
        email: 'google.oauth.demo@example.com',
        name: 'Google OAuth Verified',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      req
    )
      .then(({ tokens }) => {
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.redirect(
          `${env.CLIENT_URL}/oauth-callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&provider=google`
        );
      })
      .catch(next);
  }

  // Real OAuth 2.0 via Passport.js -> Redirects browser to accounts.google.com
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })(req, res, next);
};

/**
 * Handle Google OAuth 2.0 callback
 */
export const googleCallback = (req, res, next) => {
  if (!passport._strategies || !passport._strategies.google) {
    return res.redirect(`${env.CLIENT_URL}/oauth-callback?error=Google OAuth strategy not configured`);
  }

  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(`${env.CLIENT_URL}/login?error=Google authentication failed`);
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.redirect(
      `${env.CLIENT_URL}/oauth-callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&provider=google`
    );
  })(req, res, next);
};

/**
 * Initiate Facebook OAuth 2.0 via Passport.js
 * Redirects user to facebook.com for real authentication
 */
export const facebookAuth = (req, res, next) => {
  // Only use simulation if explicitly requested via ?demo=true
  if (req.query.demo === 'true') {
    return AuthService.findOrCreateSocialUser(
      {
        provider: 'facebook',
        providerId: `facebook_oauth_sub_${Date.now()}`,
        email: 'facebook.oauth.demo@example.com',
        name: 'Facebook OAuth Verified',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      req
    )
      .then(({ tokens }) => {
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.redirect(
          `${env.CLIENT_URL}/oauth-callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&provider=facebook`
        );
      })
      .catch(next);
  }

  // Real OAuth 2.0 via Passport.js -> Redirects browser to facebook.com
  return passport.authenticate('facebook', {
    scope: ['email'],
    session: false
  })(req, res, next);
};

/**
 * Handle Facebook OAuth 2.0 callback
 */
export const facebookCallback = (req, res, next) => {
  if (!passport._strategies || !passport._strategies.facebook) {
    return res.redirect(`${env.CLIENT_URL}/oauth-callback?error=Facebook OAuth strategy not configured`);
  }

  passport.authenticate('facebook', { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(`${env.CLIENT_URL}/login?error=Facebook authentication failed`);
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.redirect(
      `${env.CLIENT_URL}/oauth-callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&provider=facebook`
    );
  })(req, res, next);
};

