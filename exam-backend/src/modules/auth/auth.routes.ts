import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate } from '../../middleware/auth.js';
import {
  authLimiter,
  sensitiveAuthLimiter
} from '../../middleware/auth-rate-limit.js';
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
  resendOtpHandler,
  resendVerificationHandler,
  resetPasswordHandler,
  verifyOtpHandler
} from './auth.controller.js';

export const authRouter = Router();

// ─── Public ───────────────────────────────────────────────────────────────

authRouter.post('/register', sensitiveAuthLimiter, asyncHandler(registerHandler));
authRouter.post('/login', sensitiveAuthLimiter, asyncHandler(loginHandler));
authRouter.post('/verify-otp', sensitiveAuthLimiter, asyncHandler(verifyOtpHandler));
authRouter.post('/resend-otp', sensitiveAuthLimiter, asyncHandler(resendOtpHandler));
authRouter.post(
  '/forgot-password',
  sensitiveAuthLimiter,
  asyncHandler(forgotPasswordHandler)
);
authRouter.post(
  '/reset-password',
  sensitiveAuthLimiter,
  asyncHandler(resetPasswordHandler)
);
authRouter.post('/refresh', authLimiter, asyncHandler(refreshHandler));

// ─── Authenticated ────────────────────────────────────────────────────────

authRouter.get('/me', authLimiter, authenticate, asyncHandler(meHandler));
authRouter.post('/logout', authenticate, asyncHandler(logoutHandler));
authRouter.post(
  '/resend-verification',
  authenticate,
  sensitiveAuthLimiter,
  asyncHandler(resendVerificationHandler)
);
