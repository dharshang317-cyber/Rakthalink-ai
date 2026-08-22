import User from '../models/User.js';
import DonorProfile from '../models/DonorProfile.js';
import BloodRequest from '../models/BloodRequest.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   GET /api/users/profile
 * @desc    Get complete profile details of the authenticated user
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User profile not found.');
    }

    // Fetch related records count
    const donorProfile = await DonorProfile.findOne({ userId: user._id });
    const requestsCount = await BloodRequest.countDocuments({ requesterId: user._id });

    return sendSuccess(res, 200, 'User profile retrieved successfully', {
      user,
      donorProfile,
      stats: {
        totalRequestsCreated: requestsCount,
        isDonorProfileActive: !!donorProfile,
        donorAvailability: donorProfile ? donorProfile.isAvailable : false,
      },
    });
  } catch (error) {
    console.error('[GET USER PROFILE ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch user profile.');
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update basic user profile and role settings
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, city, area, role } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    // Update allowable fields
    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (city && city.trim()) user.city = city.trim();
    if (area !== undefined) user.area = area.trim();

    // Validate and update role
    if (role) {
      if (!['donor', 'requester', 'both'].includes(role)) {
        return sendError(res, 400, "Invalid role. Role must be 'donor', 'requester', or 'both'.");
      }
      // Never allow regular user to escalate to admin through profile update
      if (user.role !== 'admin') {
        user.role = role;
      }
    }

    // Mark profile completed if city & phone are provided
    if (user.city && (user.phone || role === 'requester')) {
      user.isProfileCompleted = true;
    }

    await user.save();

    const donorProfile = await DonorProfile.findOne({ userId: user._id });

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user,
      donorProfile,
    });
  } catch (error) {
    console.error('[UPDATE USER PROFILE ERROR]:', error);
    return sendError(res, 500, 'Failed to update user profile.');
  }
};

/**
 * @route   POST /api/users/deactivate
 * @desc    Deactivate user account (privacy protection)
 * @access  Private
 */
export const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    user.isDeactivated = true;
    await user.save();

    // Also mark donor profile unavailable if present
    await DonorProfile.findOneAndUpdate({ userId: user._id }, { isAvailable: false });

    return sendSuccess(res, 200, 'Your account has been deactivated. You can reactivate anytime by logging in again.');
  } catch (error) {
    console.error('[DEACTIVATE ACCOUNT ERROR]:', error);
    return sendError(res, 500, 'Failed to deactivate account.');
  }
};
