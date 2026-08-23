import Match from '../models/Match.js';
import BloodRequest from '../models/BloodRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { findMatchesForRequest } from '../services/matchingEngine.js';
import { sendMatchRequestEmail, sendDonorResponseEmail } from '../services/emailService.js';
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
 * @desc    Requester sends notification & email request to a matched donor
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

    const donor = await User.findById(match.donorId);
    const requesterName = req.user.name || 'Blood Requester';

    // 1. Create In-App Notification for the donor
    await Notification.create({
      recipientId: match.donorId,
      senderId: req.user._id,
      type: 'MATCH_FOUND',
      title: `🩸 Blood Request from ${requesterName}`,
      message: `You have been got the request from ${requesterName} for ${match.requestId.unitsRequired || 1} unit(s) of ${match.requestId.bloodGroup} at ${match.requestId.hospitalName} (${match.requestId.city}).`,
      actionLink: `/notifications`,
      relatedId: match._id,
    });

    // 2. Dispatch automated Email with Accept & Cancel buttons
    if (donor && donor.email) {
      const clientUrl = process.env.CLIENT_URL || 'https://rakthalink-ai.vercel.app';
      const acceptUrl = `${clientUrl}/match-action?matchId=${match._id}&action=ACCEPT&donorId=${donor._id}`;
      const cancelUrl = `${clientUrl}/match-action?matchId=${match._id}&action=DECLINE&donorId=${donor._id}`;

      try {
        await sendMatchRequestEmail({
          donorEmail: donor.email,
          donorName: donor.name,
          requesterName,
          bloodGroup: match.requestId.bloodGroup,
          unitsRequired: match.requestId.unitsRequired,
          hospitalName: match.requestId.hospitalName,
          city: match.requestId.city,
          acceptUrl,
          cancelUrl,
        });
      } catch (emailErr) {
        console.error('[EMAIL DISPATCH ERROR]:', emailErr.message);
      }
    }

    return sendSuccess(res, 200, 'Request sent to donor successfully via notification and email', match);
  } catch (error) {
    console.error('[SEND MATCH REQUEST ERROR]:', error);
    return sendError(res, 500, 'Failed to send match request.');
  }
};

/**
 * @route   POST /api/matches/:matchId/respond
 * @desc    Donor responds (Accept or Cancel/Decline) to a blood match request
 * @access  Private (Donor only)
 */
export const respondToMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { action, notes } = req.body; // action: 'ACCEPT' or 'DECLINE' / 'CANCEL'

    const normalizedAction = action === 'CANCEL' ? 'DECLINE' : action;

    if (!['ACCEPT', 'DECLINE'].includes(normalizedAction)) {
      return sendError(res, 400, "Invalid action. Must be 'ACCEPT' or 'DECLINE'.");
    }

    const match = await Match.findById(matchId).populate('requestId');
    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    // Verify authenticated user is the assigned donor or admin
    if (match.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You do not have permission to respond to this donor request.');
    }

    return await processDonorResponse({ match, action: normalizedAction, notes, res });
  } catch (error) {
    console.error('[RESPOND TO MATCH ERROR]:', error);
    return sendError(res, 500, 'Failed to process donor response.');
  }
};

/**
 * @route   POST /api/matches/:matchId/email-action
 * @desc    Direct action from email button click (Accept / Cancel)
 * @access  Public (Validated with donorId / match reference)
 */
export const handleEmailAction = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { action, donorId } = req.body;

    const normalizedAction = action === 'CANCEL' ? 'DECLINE' : action;

    if (!['ACCEPT', 'DECLINE'].includes(normalizedAction)) {
      return sendError(res, 400, "Invalid action. Must be 'ACCEPT' or 'DECLINE'.");
    }

    const match = await Match.findById(matchId).populate('requestId');
    if (!match) {
      return sendError(res, 404, 'Match record not found or has expired.');
    }

    if (donorId && match.donorId.toString() !== donorId.toString()) {
      return sendError(res, 403, 'Invalid donor verification for this action link.');
    }

    return await processDonorResponse({ match, action: normalizedAction, res });
  } catch (error) {
    console.error('[HANDLE EMAIL ACTION ERROR]:', error);
    return sendError(res, 500, 'Failed to process email action.');
  }
};

/**
 * Helper function to process donor decision, update DB, create in-app notification, and email requester
 */
async function processDonorResponse({ match, action, notes = '', res }) {
  const isAccepted = action === 'ACCEPT';
  match.status = isAccepted ? 'ACCEPTED' : 'DECLINED';
  match.respondedAt = new Date();
  if (notes) match.donorResponseNotes = notes.trim();
  if (isAccepted) match.contactShared = true;

  await match.save();

  // Update parent blood request status if accepted
  if (isAccepted && match.requestId) {
    await BloodRequest.findByIdAndUpdate(match.requestId._id, {
      status: 'ACCEPTED',
    });
  }

  const donor = await User.findById(match.donorId);
  const requester = await User.findById(match.requestId.requesterId);
  const donorName = donor?.name || 'Voluntary Donor';

  const notificationMessage = isAccepted
    ? `${donorName} has accepted your request`
    : `${donorName} has canceled your request`;

  // 1. In-app notification to the requester
  await Notification.create({
    recipientId: match.requestId.requesterId,
    senderId: match.donorId,
    type: isAccepted ? 'REQUEST_ACCEPTED' : 'REQUEST_DECLINED',
    title: isAccepted ? '🎉 Request Accepted!' : 'Request Canceled',
    message: notificationMessage,
    actionLink: isAccepted ? `/appointments` : `/requests/${match.requestId._id}`,
    relatedId: match._id,
  });

  // 2. Dispatch automated Email to requester
  if (requester && requester.email) {
    const clientUrl = process.env.CLIENT_URL || 'https://rakthalink-ai.vercel.app';
    try {
      await sendDonorResponseEmail({
        requesterEmail: requester.email,
        requesterName: requester.name,
        donorName,
        action: isAccepted ? 'ACCEPT' : 'DECLINE',
        bloodGroup: match.requestId.bloodGroup,
        hospitalName: match.requestId.hospitalName,
        actionLink: isAccepted ? `${clientUrl}/appointments` : `${clientUrl}/requests/${match.requestId._id}`,
      });
    } catch (emailErr) {
      console.error('[REQUESTER EMAIL ERROR]:', emailErr.message);
    }
  }

  return sendSuccess(res, 200, `Request ${isAccepted ? 'accepted' : 'canceled'} successfully`, {
    match,
    donorName,
    status: match.status,
    isAccepted,
  });
}
