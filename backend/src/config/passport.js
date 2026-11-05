import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { env } from './env.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from './logger.js';

/**
 * Configure Passport.js OAuth 2.0 Strategies
 * Follows industry standard OAuth 2.0 via Passport libraries
 */

// 1. Google OAuth 2.0 Strategy
const hasGoogleCreds =
  env.GOOGLE_CLIENT_ID &&
  env.GOOGLE_CLIENT_SECRET &&
  !env.GOOGLE_CLIENT_ID.includes('your-google-client-id') &&
  !env.GOOGLE_CLIENT_SECRET.includes('your-google-client-secret');

if (hasGoogleCreds) {
  try {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
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
    logger.info('Passport Google OAuth 2.0 Strategy initialized');
  } catch (err) {
    logger.warn('Could not initialize Google OAuth strategy', { error: err.message });
  }
} else {
  logger.info('Passport Google OAuth 2.0: Live credentials not set in .env (running in simulation/library-ready mode)');
}

// 2. Facebook OAuth 2.0 Strategy
const hasFacebookCreds =
  env.FACEBOOK_APP_ID &&
  env.FACEBOOK_APP_SECRET &&
  !env.FACEBOOK_APP_ID.includes('your-facebook-app-id') &&
  !env.FACEBOOK_APP_SECRET.includes('your-facebook-app-secret');

if (hasFacebookCreds) {
  try {
    passport.use(
      new FacebookStrategy(
        {
          clientID: env.FACEBOOK_APP_ID,
          clientSecret: env.FACEBOOK_APP_SECRET,
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
    logger.info('Passport Facebook OAuth 2.0 Strategy initialized');
  } catch (err) {
    logger.warn('Could not initialize Facebook OAuth strategy', { error: err.message });
  }
} else {
  logger.info('Passport Facebook OAuth 2.0: Live credentials not set in .env (running in simulation/library-ready mode)');
}

export default passport;
