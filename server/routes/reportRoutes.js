import express from 'express';
import { createReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All report creation routes require authentication
router.post('/', protect, createReport);

export default router;
