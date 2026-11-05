import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { env } from './env.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from './logger.js';

/**
 * Configure Passport.js OAuth 2.0 Strategies
 * Registers industry-standard Google & Facebook OAuth 2.0 strategies
 */

const googleClientId = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com'
  ? env.GOOGLE_CLIENT_ID
  : '10884920384-developer.apps.googleusercontent.com';

const googleClientSecret = env.GOOGLE_CLIENT_SECRET || 'GOCSPX-dummy-secret';

const facebookAppId = env.FACEBOOK_APP_ID && env.FACEBOOK_APP_ID !== 'your-facebook-app-id'
  ? env.FACEBOOK_APP_ID
  : '123456789012345';

const facebookAppSecret = env.FACEBOOK_APP_SECRET || 'dummy-fb-secret';

// 1. Google OAuth 2.0 Strategy
try {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await AuthService.findOrCreateSocialUser({
            provider: 'google',
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName || profile.name?.givenName || 'Google User',
            avatar: profile.photos?.[0]?.value || ''
          });
          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth Strategy error', { error: error.message });
          return done(error, null);
        }
      }
    )
  );
  logger.info('Passport Google OAuth 2.0 Strategy registered');
} catch (err) {
  logger.warn('Could not register Google OAuth strategy', { error: err.message });
}

// 2. Facebook OAuth 2.0 Strategy
try {
  passport.use(
    new FacebookStrategy(
      {
        clientID: facebookAppId,
        clientSecret: facebookAppSecret,
        callbackURL: env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'emails', 'photos']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await AuthService.findOrCreateSocialUser({
            provider: 'facebook',
            providerId: profile.id,
            email: profile.emails?.[0]?.value || `${profile.id}@facebook.user`,
            name: profile.displayName || 'Facebook User',
            avatar: profile.photos?.[0]?.value || ''
          });
          return done(null, user);
        } catch (error) {
          logger.error('Facebook OAuth Strategy error', { error: error.message });
          return done(error, null);
        }
      }
    )
  );
  logger.info('Passport Facebook OAuth 2.0 Strategy registered');
} catch (err) {
  logger.warn('Could not register Facebook OAuth strategy', { error: err.message });
}

export default passport;
