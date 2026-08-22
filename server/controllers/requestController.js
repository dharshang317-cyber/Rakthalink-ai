import BloodRequest from '../models/BloodRequest.js';
import Match from '../models/Match.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   POST /api/requests
 * @desc    Create a new blood request
 * @access  Private
 */
export const createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      city,
      area,
      coordinates, // [longitude, latitude]
      requiredDate,
      urgency,
      additionalNotes,
    } = req.body;

    // 1. Mandatory Validations
    if (!patientName || !patientName.trim()) {
      return sendError(res, 400, 'Patient name is required.');
    }
    if (!bloodGroup) {
      return sendError(res, 400, 'Required blood group must be specified.');
    }
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return sendError(res, 400, 'Invalid blood group specified.');
    }

    if (!hospitalName || !hospitalName.trim()) {
      return sendError(res, 400, 'Hospital or blood bank name is required.');
    }
    if (!city || !city.trim()) {
      return sendError(res, 400, 'City is required for location matching.');
    }
    if (!requiredDate) {
      return sendError(res, 400, 'Required date is mandatory.');
    }

    const units = Number(unitsRequired) || 1;
    if (units < 1 || units > 20) {
      return sendError(res, 400, 'Units required must be between 1 and 20.');
    }

    // 2. Build GeoJSON Location object
    let locationObj = {
      type: 'Point',
      coordinates: [0, 0],
    };

    if (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      !isNaN(coordinates[0]) &&
      !isNaN(coordinates[1])
    ) {
      locationObj.coordinates = [Number(coordinates[0]), Number(coordinates[1])];
    }

    // 3. Create BloodRequest Record
    const bloodRequest = await BloodRequest.create({
      requesterId: req.user._id,
      patientName: patientName.trim(),
      bloodGroup,
      unitsRequired: units,
      hospitalName: hospitalName.trim(),
      city: city.trim(),
      area: area ? area.trim() : '',
      location: locationObj,
      requiredDate: new Date(requiredDate),
      urgency: ['normal', 'high', 'urgent'].includes(urgency) ? urgency : 'normal',
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      status: 'OPEN',
    });

    return sendSuccess(res, 201, 'Blood request created successfully', bloodRequest);
  } catch (error) {
    console.error('[CREATE BLOOD REQUEST ERROR]:', error);
    return sendError(res, 500, 'Failed to create blood request.');
  }
};

/**
 * @route   GET /api/requests/me
 * @desc    Get all blood requests created by authenticated user
 * @access  Private
 */
export const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requesterId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach count of active matches for each request
    const requestIds = requests.map((r) => r._id);
    const matches = await Match.find({ requestId: { $in: requestIds } });

    const requestsWithMatchCounts = requests.map((reqItem) => {
      const relatedMatches = matches.filter((m) => m.requestId.toString() === reqItem._id.toString());
      return {
        ...reqItem,
        matchCount: relatedMatches.length,
        acceptedCount: relatedMatches.filter((m) => m.status === 'ACCEPTED').length,
      };
    });

    return sendSuccess(res, 200, 'Your blood requests retrieved', requestsWithMatchCounts);
  } catch (error) {
    console.error('[GET MY REQUESTS ERROR]:', error);
    return sendError(res, 500, 'Failed to retrieve your blood requests.');
  }
};

/**
 * @route   GET /api/requests
 * @desc    Get public active blood requests with filtering
 * @access  Public
 */
export const getPublicRequests = async (req, res) => {
  try {
    const { bloodGroup, city, urgency, status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['OPEN', 'MATCHED', 'IN_COORDINATION'] };
    }

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city.trim(), 'i');
    if (urgency) filter.urgency = urgency;

    const requests = await BloodRequest.find(filter)
      .populate('requesterId', 'name avatar')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return sendSuccess(res, 200, `Found ${requests.length} blood requests`, requests);
  } catch (error) {
    console.error('[GET PUBLIC REQUESTS ERROR]:', error);
    return sendError(res, 500, 'Failed to retrieve blood requests.');
  }
};

/**
 * @route   GET /api/requests/:id
 * @desc    Get single blood request details
 * @access  Public / Protected
 */
export const getRequestById = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('requesterId', 'name avatar email phone city')
      .lean();

    if (!bloodRequest) {
      return sendError(res, 404, 'Blood request not found.');
    }

    const matchesCount = await Match.countDocuments({ requestId: bloodRequest._id });

    return sendSuccess(res, 200, 'Blood request details retrieved', {
      ...bloodRequest,
      matchesCount,
    });
  } catch (error) {
    console.error('[GET REQUEST BY ID ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch blood request details.');
  }
};

/**
 * @route   PUT /api/requests/:id
 * @desc    Update blood request details (Requester or Admin only)
 * @access  Private
 */
export const updateBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return sendError(res, 404, 'Blood request not found.');
    }

    // Verify ownership or admin role
    if (bloodRequest.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You do not have permission to modify this request.');
    }

    const {
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      city,
      area,
      requiredDate,
      urgency,
      additionalNotes,
    } = req.body;

    if (patientName) bloodRequest.patientName = patientName.trim();
    if (bloodGroup) bloodRequest.bloodGroup = bloodGroup;
    if (unitsRequired) bloodRequest.unitsRequired = Number(unitsRequired);
    if (hospitalName) bloodRequest.hospitalName = hospitalName.trim();
    if (city) bloodRequest.city = city.trim();
    if (area !== undefined) bloodRequest.area = area.trim();
    if (requiredDate) bloodRequest.requiredDate = new Date(requiredDate);
    if (urgency) bloodRequest.urgency = urgency;
    if (additionalNotes !== undefined) bloodRequest.additionalNotes = additionalNotes.trim();

    await bloodRequest.save();

    return sendSuccess(res, 200, 'Blood request updated successfully', bloodRequest);
  } catch (error) {
    console.error('[UPDATE REQUEST ERROR]:', error);
    return sendError(res, 500, 'Failed to update blood request.');
  }
};

/**
 * @route   PATCH /api/requests/:id/status
 * @desc    Update blood request status (OPEN, RESOLVED, CANCELLED, etc.)
 * @access  Private
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['OPEN', 'MATCHED', 'ACCEPTED', 'IN_COORDINATION', 'RESOLVED', 'CANCELLED'];

    if (!allowedStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid status provided.');
    }

    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return sendError(res, 404, 'Blood request not found.');
    }

    if (bloodRequest.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You do not have permission to update status for this request.');
    }

    bloodRequest.status = status;
    if (status === 'RESOLVED') {
      bloodRequest.resolvedAt = new Date();
    }

    await bloodRequest.save();

    return sendSuccess(res, 200, `Blood request status updated to ${status}`, bloodRequest);
  } catch (error) {
    console.error('[UPDATE STATUS ERROR]:', error);
    return sendError(res, 500, 'Failed to update request status.');
  }
};

/**
 * @route   DELETE /api/requests/:id
 * @desc    Delete or cancel blood request
 * @access  Private
 */
export const deleteBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return sendError(res, 404, 'Blood request not found.');
    }

    if (bloodRequest.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You do not have permission to delete this request.');
    }

    // Mark as CANCELLED instead of hard deleting to preserve coordination audit trail
    bloodRequest.status = 'CANCELLED';
    await bloodRequest.save();

    return sendSuccess(res, 200, 'Blood request marked as cancelled.');
  } catch (error) {
    console.error('[DELETE REQUEST ERROR]:', error);
    return sendError(res, 500, 'Failed to delete blood request.');
  }
};
