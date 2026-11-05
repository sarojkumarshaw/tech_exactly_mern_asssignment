import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  socialLogin,
  getMe,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  socialLoginSchema
} from '../validations/auth.validation.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Public auth endpoints protected by authLimiter
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/social', validate(socialLoginSchema), socialLogin);

// OAuth 2.0 via Passport.js & Libraries
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

// Protected auth endpoints
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;

