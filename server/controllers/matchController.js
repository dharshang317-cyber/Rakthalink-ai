import Match from '../models/Match.js';
import BloodRequest from '../models/BloodRequest.js';
import Notification from '../models/Notification.js';
import { findMatchesForRequest } from '../services/matchingEngine.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   GET /api/matches/:requestId
 * @desc    Find & rank compatible voluntary donors for a blood request
 * @access  Private
 */
export const getMatchesForRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return sendError(res, 404, 'Blood request not found.');
    }

    const matches = await findMatchesForRequest(requestId);

    return sendSuccess(res, 200, `Found ${matches.length} potential matches`, {
      request,
      matches,
      stats: {
        totalMatches: matches.length,
        topScore: matches[0]?.matchScore || 0,
        exactMatches: matches.filter((m) => m.isExactMatch).length,
      },
    });
  } catch (error) {
    console.error('[GET MATCHES ERROR]:', error);
    return sendError(res, 500, 'Failed to compute matches for blood request.');
  }
};

/**
 * @route   POST /api/matches/:matchId/send-request
 * @desc    Requester sends notification request to a matched donor
 * @access  Private
 */
export const sendMatchRequest = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId).populate('requestId');
    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    // Verify requester ownership
    if (match.requestId.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You do not have permission to send requests for this record.');
    }

    match.status = 'REQUESTED';
    match.requestedAt = new Date();
    await match.save();

    // Create In-App Notification for the donor
    await Notification.create({
      recipientId: match.donorId,
      senderId: req.user._id,
      type: 'MATCH_FOUND',
      title: `🩸 Urgent Match: ${match.requestId.bloodGroup} Needed`,
      message: `A blood request for ${match.requestId.unitsRequired} units of ${match.requestId.bloodGroup} at ${match.requestId.hospitalName} (${match.requestId.city}) matches your donor profile!`,
      actionLink: `/notifications`,
      relatedId: match._id,
    });

    return sendSuccess(res, 200, 'Request sent to donor successfully', match);
  } catch (error) {
    console.error('[SEND MATCH REQUEST ERROR]:', error);
    return sendError(res, 500, 'Failed to send match request.');
  }
};

/**
 * @route   POST /api/matches/:matchId/respond
 * @desc    Donor responds (Accept or Decline) to a blood match request
 * @access  Private (Donor only)
 */
export const respondToMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { action, notes } = req.body; // action: 'ACCEPT' or 'DECLINE'

    if (!['ACCEPT', 'DECLINE'].includes(action)) {
      return sendError(res, 400, "Invalid action. Must be 'ACCEPT' or 'DECLINE'.");
    }

    const match = await Match.findById(matchId).populate('requestId');
    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    // Verify authenticated user is the assigned donor
    if (match.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You do not have permission to respond to this donor request.');
    }

    const isAccepted = action === 'ACCEPT';
    match.status = isAccepted ? 'ACCEPTED' : 'DECLINED';
    match.respondedAt = new Date();
    if (notes) match.donorResponseNotes = notes.trim();
    if (isAccepted) match.contactShared = true;

    await match.save();

    // Update parent blood request status if accepted
    if (isAccepted) {
      await BloodRequest.findByIdAndUpdate(match.requestId._id, {
        status: 'ACCEPTED',
      });
    }

    // Notify the requester of the donor's decision
    await Notification.create({
      recipientId: match.requestId.requesterId,
      senderId: req.user._id,
      type: isAccepted ? 'REQUEST_ACCEPTED' : 'REQUEST_DECLINED',
      title: isAccepted ? '🎉 Voluntary Donor Accepted!' : 'Donor Unavailable',
      message: isAccepted
        ? `A voluntary donor has accepted your blood request for ${match.requestId.hospitalName}! Contact details and coordination are now unlocked.`
        : `A potential donor declined your request. The matching engine continues to search for other donors.`,
      actionLink: `/appointments`,
      relatedId: match._id,
    });

    return sendSuccess(res, 200, `Request ${isAccepted ? 'accepted' : 'declined'} successfully`, match);
  } catch (error) {
    console.error('[RESPOND TO MATCH ERROR]:', error);
    return sendError(res, 500, 'Failed to process donor response.');
  }
};
