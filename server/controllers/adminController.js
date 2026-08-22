import User from '../models/User.js';
import DonorProfile from '../models/DonorProfile.js';
import BloodRequest from '../models/BloodRequest.js';
import Match from '../models/Match.js';
import Appointment from '../models/Appointment.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import AIConversation from '../models/AIConversation.js';
import AuditLog from '../models/AuditLog.js';
import PlatformSetting from '../models/PlatformSetting.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * ============================================================================
 * 1. 📊 ADMIN DASHBOARD OVERALL STATISTICS & KPI METRICS
 * ============================================================================
 */
export const getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await DonorProfile.countDocuments();
    const activeDonors = await DonorProfile.countDocuments({ isAvailable: true });
    const totalRequests = await BloodRequest.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: { $in: ['OPEN', 'MATCHED', 'IN_COORDINATION'] } });
    const resolvedRequests = await BloodRequest.countDocuments({ status: 'RESOLVED' });
    const pendingRequests = await BloodRequest.countDocuments({ status: 'OPEN' });
    const totalMatches = await Match.countDocuments();
    const activeMatches = await Match.countDocuments({ status: { $in: ['REQUESTED', 'ACCEPTED'] } });
    const acceptedMatches = await Match.countDocuments({ status: 'ACCEPTED' });
    const totalAppointments = await Appointment.countDocuments();
    const completedConnections = await Appointment.countDocuments({ status: 'COMPLETED' }) + resolvedRequests;
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });
    const reportedUsersCount = await Report.distinct('reportedUserId').then((ids) => ids.length);

    // Blood Group Need Distribution
    const bloodGroupStats = await BloodRequest.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Donors by Location / City
    const donorsByCity = await DonorProfile.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Urgency Breakdown
    const urgencyStats = await BloodRequest.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]);

    // AI Stats
    const totalAIConversations = await AIConversation.countDocuments();

    return sendSuccess(res, 200, 'Admin platform metrics retrieved', {
      kpis: {
        totalUsers,
        totalDonors,
        activeDonors,
        unavailableDonors: totalDonors - activeDonors,
        totalRequests,
        activeRequests,
        pendingRequests,
        resolvedRequests,
        totalMatches,
        activeMatches,
        completedConnections,
        matchSuccessRate: totalMatches > 0 ? Math.round((acceptedMatches / totalMatches) * 100) : 0,
        pendingReports,
        reportedUsersCount,
        totalAIConversations,
      },
      bloodGroupStats,
      donorsByCity,
      urgencyStats,
    });
  } catch (error) {
    console.error('[ADMIN METRICS ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch platform metrics.');
  }
};

/**
 * ============================================================================
 * 2. 👥 USER MANAGEMENT CONTROLLERS
 * ============================================================================
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, isBlocked } = req.query;

    const filter = {};
    if (role && role !== 'ALL') filter.role = role;
    if (isBlocked !== undefined && isBlocked !== 'ALL') filter.isBlocked = isBlocked === 'true';
    if (search) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { email: new RegExp(search.trim(), 'i') },
        { city: new RegExp(search.trim(), 'i') },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100).lean();

    return sendSuccess(res, 200, `Found ${users.length} users`, users);
  } catch (error) {
    console.error('[ADMIN GET USERS ERROR]:', error);
    return sendError(res, 500, 'Failed to retrieve users list.');
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found.');

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot block your own admin account.');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    if (user.isBlocked) {
      await DonorProfile.findOneAndUpdate({ userId: user._id }, { isAvailable: false });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      resourceType: 'User',
      resourceId: user._id,
      ipAddress: req.ip || '127.0.0.1',
      details: { targetEmail: user.email },
    });

    return sendSuccess(res, 200, `User ${user.name} has been ${user.isBlocked ? 'blocked' : 'unblocked'}`, user);
  } catch (error) {
    console.error('[ADMIN TOGGLE BLOCK ERROR]:', error);
    return sendError(res, 500, 'Failed to update user block state.');
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['donor', 'requester', 'both', 'admin'];

    if (!allowed.includes(role)) return sendError(res, 400, 'Invalid role specified.');

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return sendError(res, 404, 'User not found.');

    return sendSuccess(res, 200, `User role updated to ${role}`, user);
  } catch (error) {
    console.error('[ADMIN UPDATE ROLE ERROR]:', error);
    return sendError(res, 500, 'Failed to update user role.');
  }
};

/**
 * ============================================================================
 * 3. 🩸 DONOR MANAGEMENT CONTROLLERS
 * ============================================================================
 */
export const getAdminDonors = async (req, res) => {
  try {
    const { bloodGroup, city, isAvailable } = req.query;

    const filter = {};
    if (bloodGroup && bloodGroup !== 'ALL') filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city.trim(), 'i');
    if (isAvailable !== undefined && isAvailable !== 'ALL') filter.isAvailable = isAvailable === 'true';

    const donors = await DonorProfile.find(filter)
      .populate('userId', 'name email phone avatar isBlocked isDeactivated')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return sendSuccess(res, 200, `Found ${donors.length} donors`, donors);
  } catch (error) {
    console.error('[ADMIN GET DONORS ERROR]:', error);
    return sendError(res, 500, 'Failed to retrieve donors list.');
  }
};

export const toggleDonorAvailabilityAdmin = async (req, res) => {
  try {
    const donor = await DonorProfile.findById(req.params.id);
    if (!donor) return sendError(res, 404, 'Donor profile not found.');

    donor.isAvailable = !donor.isAvailable;
    await donor.save();

    return sendSuccess(res, 200, `Donor availability updated to ${donor.isAvailable ? 'Available' : 'Unavailable'}`, donor);
  } catch (error) {
    console.error('[ADMIN TOGGLE DONOR AVAILABILITY ERROR]:', error);
    return sendError(res, 500, 'Failed to update donor availability.');
  }
};

/**
 * ============================================================================
 * 4. 🏥 BLOOD REQUEST MANAGEMENT CONTROLLERS
 * ============================================================================
 */
export const getAdminRequests = async (req, res) => {
  try {
    const { bloodGroup, urgency, status, city } = req.query;

    const filter = {};
    if (bloodGroup && bloodGroup !== 'ALL') filter.bloodGroup = bloodGroup;
    if (urgency && urgency !== 'ALL') filter.urgency = urgency;
    if (status && status !== 'ALL') filter.status = status;
    if (city) filter.city = new RegExp(city.trim(), 'i');

    const requests = await BloodRequest.find(filter)
      .populate('requesterId', 'name email avatar phone')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return sendSuccess(res, 200, `Found ${requests.length} blood requests`, requests);
  } catch (error) {
    console.error('[ADMIN GET REQUESTS ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch blood requests.');
  }
};

export const updateRequestStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return sendError(res, 404, 'Blood request not found.');

    request.status = status;
    if (status === 'RESOLVED') request.resolvedAt = new Date();
    await request.save();

    return sendSuccess(res, 200, `Blood request status updated to ${status}`, request);
  } catch (error) {
    console.error('[ADMIN UPDATE REQUEST STATUS ERROR]:', error);
    return sendError(res, 500, 'Failed to update request status.');
  }
};

/**
 * ============================================================================
 * 5. 🔗 MATCH MONITORING CONTROLLERS
 * ============================================================================
 */
export const getAdminMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('donorId', 'name email phone avatar')
      .populate('requestId', 'patientName bloodGroup unitsRequired hospitalName urgency city')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return sendSuccess(res, 200, 'Matches retrieved', matches);
  } catch (error) {
    console.error('[ADMIN GET MATCHES ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch matches.');
  }
};

/**
 * ============================================================================
 * 6. 🔔 NOTIFICATION & ANNOUNCEMENT BROADCAST
 * ============================================================================
 */
export const broadcastAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      return sendError(res, 400, 'Announcement title and message are required.');
    }

    const userFilter = {};
    if (targetRole && targetRole !== 'ALL') {
      userFilter.role = { $in: [targetRole, 'both'] };
    }

    const users = await User.find(userFilter).select('_id');

    const notifications = users.map((u) => ({
      recipientId: u._id,
      senderId: req.user._id,
      type: 'SYSTEM_ALERT',
      title: `📢 ${title}`,
      message,
      actionLink: '/notifications',
    }));

    await Notification.insertMany(notifications);

    return sendSuccess(res, 200, `Announcement broadcasted to ${users.length} users successfully`);
  } catch (error) {
    console.error('[ADMIN BROADCAST ERROR]:', error);
    return sendError(res, 500, 'Failed to broadcast announcement.');
  }
};

/**
 * ============================================================================
 * 7. 🚨 REPORTS & COMPLAINTS MANAGEMENT
 * ============================================================================
 */
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email avatar')
      .populate('reportedUserId', 'name email phone isBlocked')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Safety reports retrieved', reports);
  } catch (error) {
    console.error('[ADMIN GET REPORTS ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch reports.');
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { status, adminNotes, blockReportedUser } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return sendError(res, 404, 'Report not found.');

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes.trim();
    if (status === 'RESOLVED') {
      report.resolvedAt = new Date();
      report.resolvedBy = req.user._id;
    }
    await report.save();

    if (blockReportedUser && report.reportedUserId) {
      await User.findByIdAndUpdate(report.reportedUserId, { isBlocked: true });
      await DonorProfile.findOneAndUpdate({ userId: report.reportedUserId }, { isAvailable: false });
    }

    return sendSuccess(res, 200, 'Report resolution saved', report);
  } catch (error) {
    console.error('[ADMIN RESOLVE REPORT ERROR]:', error);
    return sendError(res, 500, 'Failed to resolve report.');
  }
};

/**
 * ============================================================================
 * 8. 🤖 AI USAGE & ACTIVITY MONITORING
 * ============================================================================
 */
export const getAIMonitoringStats = async (req, res) => {
  try {
    const totalConversations = await AIConversation.countDocuments();
    const recentConversations = await AIConversation.find()
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    return sendSuccess(res, 200, 'AI monitoring stats retrieved', {
      totalConversations,
      activeModel: process.env.AI_MODEL || 'gemini-1.5-flash',
      isLiveKeyConfigured: !!(process.env.AI_API_KEY && !process.env.AI_API_KEY.startsWith('mock_')),
      recentConversations,
    });
  } catch (error) {
    console.error('[ADMIN AI MONITORING ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch AI monitoring stats.');
  }
};

/**
 * ============================================================================
 * 9 & 10. ⚙️ PLATFORM SETTINGS
 * ============================================================================
 */
export const getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = await PlatformSetting.create({});
    }
    return sendSuccess(res, 200, 'Platform settings retrieved', settings);
  } catch (error) {
    console.error('[ADMIN GET SETTINGS ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch platform settings.');
  }
};

export const updatePlatformSettings = async (req, res) => {
  try {
    const {
      siteName,
      tagline,
      announcementBanner,
      isAnnouncementActive,
      maintenanceMode,
      emergencyContactPhone,
      supportedCities,
    } = req.body;

    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = new PlatformSetting();
    }

    if (siteName) settings.siteName = siteName;
    if (tagline) settings.tagline = tagline;
    if (announcementBanner !== undefined) settings.announcementBanner = announcementBanner;
    if (isAnnouncementActive !== undefined) settings.isAnnouncementActive = isAnnouncementActive;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (emergencyContactPhone) settings.emergencyContactPhone = emergencyContactPhone;
    if (Array.isArray(supportedCities)) settings.supportedCities = supportedCities;

    settings.updatedBy = req.user._id;
    await settings.save();

    return sendSuccess(res, 200, 'Platform settings updated successfully', settings);
  } catch (error) {
    console.error('[ADMIN UPDATE SETTINGS ERROR]:', error);
    return sendError(res, 500, 'Failed to update platform settings.');
  }
};
