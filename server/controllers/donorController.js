import DonorProfile from '../models/DonorProfile.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   GET /api/donors/profile
 * @desc    Get donor profile of the authenticated user
 * @access  Private
 */
export const getDonorProfile = async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user._id });

    if (!donorProfile) {
      return sendSuccess(res, 200, 'No donor profile found yet for this account', null);
    }

    return sendSuccess(res, 200, 'Donor profile retrieved', donorProfile);
  } catch (error) {
    console.error('[GET DONOR PROFILE ERROR]:', error);
    return sendError(res, 500, 'Failed to fetch donor profile.');
  }
};

/**
 * @route   POST /api/donors/profile & PUT /api/donors/profile
 * @desc    Create or update donor profile for authenticated user
 * @access  Private
 */
export const createOrUpdateDonorProfile = async (req, res) => {
  try {
    const {
      bloodGroup,
      isAvailable,
      lastDonationDate,
      preferredContactMethod,
      city,
      area,
      coordinates, // [longitude, latitude]
      donationNotes,
    } = req.body;

    if (!bloodGroup) {
      return sendError(res, 400, 'Blood group is mandatory for donor registration.');
    }

    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return sendError(res, 400, 'Invalid blood group specified.');
    }

    if (!city || !city.trim()) {
      return sendError(res, 400, 'City is required for location matching.');
    }

    // Build location GeoJSON object
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

    // Upsert DonorProfile
    let donorProfile = await DonorProfile.findOne({ userId: req.user._id });

    if (donorProfile) {
      donorProfile.bloodGroup = bloodGroup;
      if (isAvailable !== undefined) donorProfile.isAvailable = Boolean(isAvailable);
      if (lastDonationDate !== undefined) donorProfile.lastDonationDate = lastDonationDate || null;
      if (preferredContactMethod) donorProfile.preferredContactMethod = preferredContactMethod;
      donorProfile.city = city.trim();
      if (area !== undefined) donorProfile.area = area.trim();
      if (coordinates) donorProfile.location = locationObj;
      if (donationNotes !== undefined) donorProfile.donationNotes = donationNotes.trim();

      await donorProfile.save();
    } else {
      donorProfile = await DonorProfile.create({
        userId: req.user._id,
        bloodGroup,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        lastDonationDate: lastDonationDate || null,
        preferredContactMethod: preferredContactMethod || 'in_app',
        city: city.trim(),
        area: area ? area.trim() : '',
        location: locationObj,
        donationNotes: donationNotes ? donationNotes.trim() : '',
      });
    }

    // Ensure User record also has matching city and role updated
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.city && city) user.city = city.trim();
      if (user.role === 'requester') user.role = 'both';
      await user.save();
    }

    return sendSuccess(res, 200, 'Donor profile saved successfully', donorProfile);
  } catch (error) {
    console.error('[UPSERT DONOR PROFILE ERROR]:', error);
    return sendError(res, 500, 'Failed to save donor profile.');
  }
};

/**
 * @route   PUT /api/donors/availability
 * @desc    Fast atomic toggle for donor live availability status
 * @access  Private
 */
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return sendError(res, 400, 'isAvailable boolean is required.');
    }

    const donorProfile = await DonorProfile.findOne({ userId: req.user._id });
    if (!donorProfile) {
      return sendError(res, 404, 'No donor profile found. Please register as a donor first.');
    }

    donorProfile.isAvailable = Boolean(isAvailable);
    await donorProfile.save();

    return sendSuccess(res, 200, `Availability updated to: ${donorProfile.isAvailable ? 'Available (Active)' : 'Unavailable (Paused)'}`, {
      isAvailable: donorProfile.isAvailable,
      updatedAt: donorProfile.updatedAt,
    });
  } catch (error) {
    console.error('[TOGGLE AVAILABILITY ERROR]:', error);
    return sendError(res, 500, 'Failed to update availability.');
  }
};

/**
 * @route   GET /api/donors/search
 * @desc    Search voluntary donors with privacy redaction (no phone/exact address)
 * @access  Public / Protected
 */
export const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, city, availableOnly } = req.query;

    const filter = {
      ...(availableOnly !== 'false' && { isAvailable: true }),
    };

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }
    if (city) {
      filter.city = new RegExp(city.trim(), 'i');
    }

    const donors = await DonorProfile.find(filter)
      .populate('userId', 'name avatar isBlocked isDeactivated')
      .limit(30)
      .lean();

    // Filter out blocked/deactivated users and redact sensitive phone/coordinates
    const sanitizedDonors = donors
      .filter((d) => d.userId && !d.userId.isBlocked && !d.userId.isDeactivated)
      .map((d) => ({
        _id: d._id,
        donorName: d.userId.name.split(' ')[0] + ' ' + (d.userId.name.split(' ')[1]?.[0] || '') + '.',
        avatar: d.userId.avatar,
        bloodGroup: d.bloodGroup,
        city: d.city,
        area: d.area,
        isAvailable: d.isAvailable,
        totalDonations: d.totalDonations,
        preferredContactMethod: d.preferredContactMethod,
      }));

    return sendSuccess(res, 200, `Found ${sanitizedDonors.length} potential voluntary donors`, sanitizedDonors);
  } catch (error) {
    console.error('[SEARCH DONORS ERROR]:', error);
    return sendError(res, 500, 'Failed to query voluntary donors.');
  }
};
