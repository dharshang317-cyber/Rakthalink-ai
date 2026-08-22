import User from '../models/User.js';
import DonorProfile from '../models/DonorProfile.js';
import { verifyGoogleToken } from '../config/googleAuth.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Dedicated list of designated Platform Administrators
const DESIGNATED_ADMIN_EMAILS = [
  'dharshang317@gmail.com',
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()) : []),
];

/**
 * Helper to generate a vibrant, high-resolution default avatar if Google does not return one
 */
const getDefaultAvatar = (name) => {
  const cleanName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${cleanName}&background=dc2626&color=ffffff&bold=true&rounded=true`;
};

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate or Register user using Google OAuth 2.0 ID Token
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return sendError(res, 400, 'Google credential (ID Token) is required.');
    }

    let googleUser = null;

    // Verify token with Google's public key servers
    const verification = await verifyGoogleToken(credential);

    if (verification.success) {
      googleUser = verification.payload;
    } else {
      // Fallback only if Google verification failed: check if it's a test environment token
      if (process.env.NODE_ENV === 'development' && credential.startsWith('dev_test_token_')) {
        const testEmail = credential.replace('dev_test_token_', '').toLowerCase();
        const testName = testEmail.split('@')[0];
        googleUser = {
          googleId: `google_dev_${testEmail}`,
          email: testEmail,
          name: testName,
          avatar: getDefaultAvatar(testName),
          emailVerified: true,
        };
      } else {
        return sendError(res, 401, 'Invalid Google authentication token. Please try again.');
      }
    }

    const emailNormalized = googleUser.email.toLowerCase();
    const isAdminEmail = DESIGNATED_ADMIN_EMAILS.includes(emailNormalized);
    const resolvedAvatar = googleUser.avatar || getDefaultAvatar(googleUser.name);

    // 1. Check if user already exists by googleId OR by email
    let user = await User.findOne({
      $or: [{ googleId: googleUser.googleId }, { email: emailNormalized }],
    });

    let isNewUser = false;

    if (!user) {
      // 2. Create new user account with guaranteed avatar
      user = await User.create({
        googleId: googleUser.googleId,
        email: emailNormalized,
        name: googleUser.name,
        avatar: resolvedAvatar,
        role: isAdminEmail ? 'admin' : 'both', // Auto-elevate designated admin
        isProfileCompleted: false,
        lastLogin: new Date(),
      });
      isNewUser = true;
    } else {
      // 3. Update existing user's last login and ensure high quality avatar
      user.lastLogin = new Date();
      if (googleUser.avatar) {
        user.avatar = googleUser.avatar;
      } else if (!user.avatar) {
        user.avatar = getDefaultAvatar(user.name);
      }
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
      }
      // Ensure designated admin email always maintains admin role
      if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
      }
      await user.save();
    }

    // Check account status
    if (user.isBlocked) {
      return sendError(res, 403, 'Your account is suspended. Contact RakthaLink administration.');
    }
    if (user.isDeactivated) {
      return sendError(res, 403, 'Your account is currently deactivated. Please contact support.');
    }

    // 4. Generate custom server JWT token
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // 5. Fetch associated donor profile if existing
    const donorProfile = await DonorProfile.findOne({ userId: user._id });

    return sendSuccess(res, isNewUser ? 201 : 200, isNewUser ? 'Account created successfully with Google' : 'Login successful', {
      token,
      user,
      donorProfile,
      isNewUser,
    });
  } catch (error) {
    console.error('[AUTH CONTROLLER ERROR]:', error);
    return sendError(res, 500, 'Authentication failed due to server error.');
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get profile of currently logged-in user with donor profile
 * @access  Private (Protected by JWT)
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    // Check if user is in designated admin list and ensure role is updated
    if (user.email && DESIGNATED_ADMIN_EMAILS.includes(user.email.toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
    }

    // Ensure avatar is populated
    if (!user.avatar) {
      user.avatar = getDefaultAvatar(user.name);
      await user.save();
    }

    const donorProfile = await DonorProfile.findOne({ userId: user._id });

    return sendSuccess(res, 200, 'User profile retrieved', {
      user,
      donorProfile,
    });
  } catch (error) {
    console.error('[GET ME ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch user profile.');
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (Session invalidation response)
 * @access  Private
 */
export const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully');
};
