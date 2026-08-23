import express from 'express';
import {
  getMatchesForRequest,
  sendMatchRequest,
  respondToMatch,
  handleEmailAction,
} from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public email action handler (Token/reference verified)
router.post('/:matchId/email-action', handleEmailAction);

// Authenticated in-app match routes
router.use(protect);

router.get('/:requestId', getMatchesForRequest);
router.post('/:matchId/send-request', sendMatchRequest);
router.post('/:matchId/respond', respondToMatch);

export default router;
