import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  markMessagesRead,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

router.post('/messages', sendMessage);
router.get('/messages/:recipientId', getMessages);
router.get('/conversations', getConversations);
router.patch('/messages/:recipientId/read', markMessagesRead);

export default router;
