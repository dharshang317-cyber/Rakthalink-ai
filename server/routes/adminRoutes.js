import express from 'express';
import {
  getAdminMetrics,
  getAllUsers,
  toggleUserBlock,
  updateUserRole,
  getAdminDonors,
  toggleDonorAvailabilityAdmin,
  getAdminRequests,
  updateRequestStatusAdmin,
  getAdminMatches,
  broadcastAnnouncement,
  getAllReports,
  resolveReport,
  getAIMonitoringStats,
  getPlatformSettings,
  updatePlatformSettings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict RBAC: All Admin routes require valid JWT + role: 'admin'
router.use(protect);
router.use(authorize('admin'));

// 1. 📊 Overview Metrics & Analytics
router.get('/metrics', getAdminMetrics);

// 2. 👥 User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/block', toggleUserBlock);
router.patch('/users/:id/role', updateUserRole);

// 3. 🩸 Donor Management
router.get('/donors', getAdminDonors);
router.patch('/donors/:id/availability', toggleDonorAvailabilityAdmin);

// 4. 🏥 Blood Request Management
router.get('/requests', getAdminRequests);
router.patch('/requests/:id/status', updateRequestStatusAdmin);

// 5. 🔗 Match Monitoring
router.get('/matches', getAdminMatches);

// 6. 🔔 System Announcements & Broadcast
router.post('/announcements/broadcast', broadcastAnnouncement);

// 7. 🚨 Safety & Fraud Reports
router.get('/reports', getAllReports);
router.patch('/reports/:id', resolveReport);

// 8. 🤖 AI Usage Monitoring
router.get('/ai-stats', getAIMonitoringStats);

// 9 & 10. ⚙️ Platform Settings
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

export default router;
