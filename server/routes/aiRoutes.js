import express from 'express';
import { extractRequestFromText, chatWithAssistant } from '../controllers/aiController.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Sensitive rate limiter applied to AI endpoints
router.use(sensitiveLimiter);

router.post('/request-assistance', extractRequestFromText);
router.post('/chat', chatWithAssistant);

export default router;
