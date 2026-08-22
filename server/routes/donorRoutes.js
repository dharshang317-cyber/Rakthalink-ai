import express from 'express';
import {
  getDonorProfile,
  createOrUpdateDonorProfile,
  updateAvailability,
  searchDonors,
} from '../controllers/donorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Privacy-Redacted Donor Search
router.get('/search', searchDonors);

// Protected Donor Management Endpoints
router.get('/profile', protect, getDonorProfile);
router.post('/profile', protect, createOrUpdateDonorProfile);
router.put('/profile', protect, createOrUpdateDonorProfile);
router.put('/availability', protect, updateAvailability);

export default router;
