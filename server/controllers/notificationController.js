import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user with unread count
 * @access  Private
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, 200, 'Notifications retrieved', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('[GET NOTIFICATIONS ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch notifications.');
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    return sendSuccess(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    console.error('[MARK AS READ ERROR]:', error);
    return sendError(res, 500, 'Failed to mark notification as read.');
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications for authenticated user as read
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });

    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    console.error('[MARK ALL AS READ ERROR]:', error);
    return sendError(res, 500, 'Failed to mark all notifications as read.');
  }
};
