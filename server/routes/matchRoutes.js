import express from 'express';
import {
  getMatchesForRequest,
  sendMatchRequest,
  respondToMatch,
} from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All match routes are protected by JWT authentication
router.use(protect);

router.get('/:requestId', getMatchesForRequest);
router.post('/:matchId/send-request', sendMatchRequest);
router.post('/:matchId/respond', respondToMatch);

export default router;
