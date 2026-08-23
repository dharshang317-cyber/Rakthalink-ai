import BloodRequest from '../models/BloodRequest.js';
import DonorProfile from '../models/DonorProfile.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import { getCompatibleDonorGroups, getCompatibilityScore } from '../utils/bloodCompatibility.js';
import { calculateDistanceKm, getProximityScore } from '../utils/haversine.js';

/**
 * ============================================================================
 * RAKTHALINK AI - SMART MATCHING & RANKING ENGINE
 * Transparent multi-factor algorithm computing the Platform Match Score (0-100)
 * ============================================================================
 */

export const findMatchesForRequest = async (requestId) => {
  const request = await BloodRequest.findById(requestId);
  if (!request) {
    throw new Error('Blood request not found');
  }

  // 1. Step 1: Hard Eligibility Filter
  const compatibleBloodGroups = getCompatibleDonorGroups(request.bloodGroup);

  const eligibleDonors = await DonorProfile.find({
    bloodGroup: { $in: compatibleBloodGroups },
    isAvailable: true,
  })
    .populate('userId', 'name email phone avatar isBlocked isDeactivated')
    .lean();

  // Filter out blocked/deactivated users and exclude requester themselves
  const activeDonors = eligibleDonors.filter(
    (d) =>
      d.userId &&
      !d.userId.isBlocked &&
      !d.userId.isDeactivated &&
      d.userId._id.toString() !== request.requesterId.toString()
  );

  if (activeDonors.length === 0) {
    return [];
  }

  // 2. Step 2 & 3: Multi-Factor Scoring & Ranking
  const rankedMatches = [];

  for (const donor of activeDonors) {
    // Factor A: Blood Compatibility Score (35%)
    const compatScore = getCompatibilityScore(donor.bloodGroup, request.bloodGroup);

    // Factor B: Geodesic Distance & Proximity Score (40%)
    const distanceKm = calculateDistanceKm(
      donor.location?.coordinates,
      request.location?.coordinates
    );
    const isSameCity =
      donor.city && request.city && donor.city.toLowerCase() === request.city.toLowerCase();
    const proximityScore = getProximityScore(distanceKm, isSameCity);

    // Factor C: Donation Recency & Gap Score (15%)
    let recencyScore = 100;
    if (donor.lastDonationDate) {
      const daysSinceDonation = Math.floor(
        (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceDonation >= 0 && daysSinceDonation < 90) {
        recencyScore = Math.max(20, Math.round((daysSinceDonation / 90) * 100));
      }
    }

    // Factor D: Request Urgency Normalizer (10%)
    const urgencyScores = { urgent: 100, high: 80, normal: 60 };
    const urgencyScore = urgencyScores[request.urgency] || 70;

    // Composite Weighted Platform Match Score (0 - 100)
    const compositeScore = Math.min(
      100,
      Math.max(
        10,
        Math.round(
          compatScore * 0.35 +
            proximityScore * 0.40 +
            recencyScore * 0.15 +
            urgencyScore * 0.10
        )
      )
    );

    // 3. Upsert Match Record in Database
    const existingMatch = await Match.findOne({
      requestId: request._id,
      donorId: donor.userId._id,
    });

    let matchRecord;
    if (existingMatch) {
      existingMatch.matchScore = compositeScore;
      existingMatch.distanceKm = distanceKm;
      await existingMatch.save();
      matchRecord = existingMatch;
    } else {
      matchRecord = await Match.create({
        requestId: request._id,
        donorId: donor.userId._id,
        donorProfileId: donor._id,
        matchScore: compositeScore,
        distanceKm: distanceKm,
        status: 'PENDING',
        contactShared: false,
      });
    }

    // Prepare privacy-safe match card object
    rankedMatches.push({
      matchId: matchRecord._id,
      requestId: request._id,
      donorId: donor.userId._id,
      donorName: donor.userId.name.split(' ')[0] + ' ' + (donor.userId.name.split(' ')[1]?.[0] || '') + '.',
      donorAvatar: donor.userId.avatar,
      donorBloodGroup: donor.bloodGroup,
      isExactMatch: donor.bloodGroup === request.bloodGroup,
      distanceKm: distanceKm,
      distanceDisplay: distanceKm !== null ? `Approximately ${distanceKm} km away` : `${donor.city || 'Nearby area'}`,
      city: donor.city,
      area: donor.area,
      matchScore: compositeScore,
      status: matchRecord.status,
      contactShared: matchRecord.contactShared,
      totalDonations: donor.totalDonations || 0,
      scoreBreakdown: {
        compatibility: compatScore,
        proximity: proximityScore,
        recency: recencyScore,
        urgency: urgencyScore,
      },
    });
  }

  // Sort ranked matches by highest Platform Match Score first
  rankedMatches.sort((a, b) => b.matchScore - a.matchScore);

  // Update request with matched count and status
  if (request.status === 'OPEN' && rankedMatches.length > 0) {
    request.status = 'MATCHED';
    request.matchedDonorsCount = rankedMatches.length;
    await request.save();
  }

  return rankedMatches;
};
