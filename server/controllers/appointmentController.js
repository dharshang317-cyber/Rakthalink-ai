import Appointment from '../models/Appointment.js';
import Match from '../models/Match.js';
import BloodRequest from '../models/BloodRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   POST /api/appointments
 * @desc    Schedule a hospital blood bank donation appointment
 * @access  Private
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      requestId,
      matchId,
      hospitalName,
      hospitalAddress,
      scheduledDate,
      timeSlot,
      coordinationNotes,
    } = req.body;

    if (!requestId || !matchId || !hospitalName || !scheduledDate || !timeSlot) {
      return sendError(res, 400, 'All required appointment fields must be provided.');
    }

    const match = await Match.findById(matchId).populate('requestId');
    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    // Verify user is either donor or requester
    const isDonor = match.donorId.toString() === req.user._id.toString();
    const isRequester = match.requestId.requesterId.toString() === req.user._id.toString();

    if (!isDonor && !isRequester && req.user.role !== 'admin') {
      return sendError(res, 403, 'You do not have permission to schedule for this match.');
    }

    const appointment = await Appointment.create({
      requestId,
      matchId,
      donorId: match.donorId,
      requesterId: match.requestId.requesterId,
      hospitalName: hospitalName.trim(),
      hospitalAddress: hospitalAddress ? hospitalAddress.trim() : '',
      scheduledDate: new Date(scheduledDate),
      timeSlot: timeSlot.trim(),
      coordinationNotes: coordinationNotes ? coordinationNotes.trim() : '',
      status: 'CONFIRMED',
    });

    // Update parent blood request status to IN_COORDINATION
    await BloodRequest.findByIdAndUpdate(requestId, { status: 'IN_COORDINATION' });

    // Send notification to the other party
    const targetUserId = isRequester ? match.donorId : match.requestId.requesterId;
    await Notification.create({
      recipientId: targetUserId,
      senderId: req.user._id,
      type: 'APPOINTMENT_SCHEDULED',
      title: '📅 Hospital Donation Appointment Scheduled',
      message: `A blood donation appointment has been coordinated at ${hospitalName} for ${new Date(scheduledDate).toLocaleDateString()} (${timeSlot}).`,
      actionLink: `/appointments`,
      relatedId: appointment._id,
    });

    return sendSuccess(res, 201, 'Hospital appointment scheduled successfully', appointment);
  } catch (error) {
    console.error('[CREATE APPOINTMENT ERROR]:', error);
    return sendError(res, 500, 'Failed to create appointment.');
  }
};

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments where authenticated user is donor or requester
 * @access  Private
 */
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ donorId: req.user._id }, { requesterId: req.user._id }],
    })
      .populate('donorId', 'name email phone avatar')
      .populate('requesterId', 'name email phone avatar')
      .populate('requestId', 'patientName bloodGroup unitsRequired hospitalName urgency')
      .sort({ scheduledDate: -1 })
      .lean();

    return sendSuccess(res, 200, 'Appointments retrieved', appointments);
  } catch (error) {
    console.error('[GET APPOINTMENTS ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch appointments.');
  }
};

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status (CONFIRMED, COMPLETED, CANCELLED)
 * @access  Private
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

    if (!allowed.includes(status)) {
      return sendError(res, 400, 'Invalid appointment status.');
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return sendError(res, 404, 'Appointment not found.');
    }

    appointment.status = status;
    if (status === 'CANCELLED' && cancellationReason) {
      appointment.cancellationReason = cancellationReason.trim();
    }
    if (status === 'COMPLETED') {
      appointment.completedAt = new Date();
      // Mark blood request resolved
      await BloodRequest.findByIdAndUpdate(appointment.requestId, {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      });
    }

    await appointment.save();

    return sendSuccess(res, 200, `Appointment marked as ${status}`, appointment);
  } catch (error) {
    console.error('[UPDATE APPOINTMENT STATUS ERROR]:', error);
    return sendError(res, 500, 'Failed to update appointment status.');
  }
};

/**
 * @route   GET /api/appointments/match/:matchId/contact
 * @desc    Privacy-Gated Mutual Contact Retrieval (Unlocked ONLY if donor accepted)
 * @access  Private
 */
export const getSharedContactDetails = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId).populate('requestId');
    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    // Verify authorized user
    const isDonor = match.donorId.toString() === req.user._id.toString();
    const isRequester = match.requestId.requesterId.toString() === req.user._id.toString();

    if (!isDonor && !isRequester && req.user.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized to view contact details.');
    }

    if (!match.contactShared || match.status !== 'ACCEPTED') {
      return sendError(
        res,
        403,
        'Contact details are locked. Phone numbers are only shared after the voluntary donor explicitly accepts the request.'
      );
    }

    // Fetch mutual details
    const donorUser = await User.findById(match.donorId).select('name email phone avatar city area');
    const requesterUser = await User.findById(match.requestId.requesterId).select('name email phone avatar city area');

    return sendSuccess(res, 200, 'Mutual contact details unlocked', {
      donor: donorUser,
      requester: requesterUser,
      hospitalName: match.requestId.hospitalName,
      patientName: match.requestId.patientName,
      bloodGroup: match.requestId.bloodGroup,
    });
  } catch (error) {
    console.error('[GET CONTACT DETAILS ERROR]:', error);
    return sendError(res, 500, 'Failed to retrieve shared contact info.');
  }
};
