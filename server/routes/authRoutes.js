import express from 'express';
import { googleAuth, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Authentication Route with sensitive rate limiter
router.post('/google', sensitiveLimiter, googleAuth);

// Protected Routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
