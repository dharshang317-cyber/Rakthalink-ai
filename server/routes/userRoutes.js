import express from 'express';
import { getUserProfile, updateUserProfile, deactivateAccount } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes are protected by JWT authentication
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/deactivate', deactivateAccount);

export default router;
