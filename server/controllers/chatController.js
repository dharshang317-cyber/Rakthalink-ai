import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   POST /api/chat/messages
 * @desc    Send a new chat message to a donor or requester
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId, text, matchId, requestId } = req.body;

    if (!recipientId) {
      return sendError(res, 400, 'Recipient ID is required.');
    }

    if (!text || !text.trim()) {
      return sendError(res, 400, 'Message text cannot be empty.');
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return sendError(res, 404, 'Recipient user not found.');
    }

    const message = await ChatMessage.create({
      senderId,
      recipientId,
      text: text.trim(),
      matchId: matchId || null,
      requestId: requestId || null,
    });

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('senderId', 'name avatar role email')
      .populate('recipientId', 'name avatar role email');

    // Create an in-app notification for the recipient
    try {
      await Notification.create({
        recipientId,
        senderId,
        type: 'SYSTEM_NOTICE',
        title: `💬 New Message from ${req.user.name}`,
        message: `"${text.trim().slice(0, 90)}${text.trim().length > 90 ? '...' : ''}"`,
        actionLink: `/notifications`,
        relatedId: message._id,
      });
    } catch (notifErr) {
      // Non-blocking notification failure
    }

    return sendSuccess(res, 201, 'Message sent successfully', populatedMessage);
  } catch (error) {
    console.error('[SEND MESSAGE ERROR]:', error);
    return sendError(res, 500, 'Failed to send message.');
  }
};

/**
 * @route   GET /api/chat/messages/:recipientId
 * @desc    Get all messages between authenticated user and another user
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { recipientId } = req.params;

    if (!recipientId) {
      return sendError(res, 400, 'Recipient ID is required.');
    }

    // Retrieve full chat history in chronological order
    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUserId, recipientId },
        { senderId: recipientId, recipientId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar role email')
      .populate('recipientId', 'name avatar role email');

    // Automatically mark incoming messages as read
    await ChatMessage.updateMany(
      { senderId: recipientId, recipientId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return sendSuccess(res, 200, 'Messages fetched successfully', messages);
  } catch (error) {
    console.error('[GET MESSAGES ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch conversation history.');
  }
};

/**
 * @route   GET /api/chat/conversations
 * @desc    Get list of all active conversations for the authenticated user
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all unique user IDs that the current user has chatted with
    const sentMessages = await ChatMessage.find({ senderId: currentUserId }).distinct('recipientId');
    const receivedMessages = await ChatMessage.find({ recipientId: currentUserId }).distinct('senderId');

    const partnerIds = [...new Set([...sentMessages.map(String), ...receivedMessages.map(String)])];

    if (partnerIds.length === 0) {
      return sendSuccess(res, 200, 'No active conversations', []);
    }

    // Retrieve partner profiles and last message for each conversation
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId).select('name avatar role email phone city');
        if (!partner) return null;

        const lastMessage = await ChatMessage.findOne({
          $or: [
            { senderId: currentUserId, recipientId: partnerId },
            { senderId: partnerId, recipientId: currentUserId },
          ],
        }).sort({ createdAt: -1 });

        const unreadCount = await ChatMessage.countDocuments({
          senderId: partnerId,
          recipientId: currentUserId,
          isRead: false,
        });

        return {
          partner,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Filter out nulls and sort by latest message timestamp
    const sortedConversations = conversations
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));

    return sendSuccess(res, 200, 'Conversations fetched successfully', sortedConversations);
  } catch (error) {
    console.error('[GET CONVERSATIONS ERROR]:', error);
    return sendError(res, 500, 'Failed to load conversations list.');
  }
};

/**
 * @route   PATCH /api/chat/messages/:recipientId/read
 * @desc    Mark all messages from a specific partner as read
 * @access  Private
 */
export const markMessagesRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { recipientId } = req.params;

    await ChatMessage.updateMany(
      { senderId: recipientId, recipientId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return sendSuccess(res, 200, 'Messages marked as read');
  } catch (error) {
    console.error('[MARK READ ERROR]:', error);
    return sendError(res, 500, 'Failed to update read status.');
  }
};
