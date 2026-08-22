import express from 'express';
import {
  createBloodRequest,
  getMyRequests,
  getPublicRequests,
  getRequestById,
  updateBloodRequest,
  updateRequestStatus,
  deleteBloodRequest,
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / General Request Discovery
router.get('/', getPublicRequests);
router.get('/:id', getRequestById);

// Protected Requester Endpoints
router.post('/', protect, createBloodRequest);
router.get('/user/me', protect, getMyRequests);
router.put('/:id', protect, updateBloodRequest);
router.patch('/:id/status', protect, updateRequestStatus);
router.delete('/:id', protect, deleteBloodRequest);

export default router;
