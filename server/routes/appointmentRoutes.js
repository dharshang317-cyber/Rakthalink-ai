import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getSharedContactDetails,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All appointment routes are protected
router.use(protect);

router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.patch('/:id/status', updateAppointmentStatus);
router.get('/match/:matchId/contact', getSharedContactDetails);

export default router;
