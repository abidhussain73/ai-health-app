import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  verifyEmail
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many auth requests. Try again later.'
    }
  }
});

router.use(authRateLimiter);

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getCurrentUser);

export default router;
