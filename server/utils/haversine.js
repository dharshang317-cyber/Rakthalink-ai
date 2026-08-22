/**
 * Haversine Formula for Geodesic Distance Calculation
 * Calculates the great-circle distance between two points on the Earth's surface in kilometers.
 */

const EARTH_RADIUS_KM = 6371; // Earth's mean radius in kilometers

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculates geodesic distance in kilometers between two coordinate pairs [longitude, latitude].
 * @param {Array<number>} coord1 - [lng1, lat1]
 * @param {Array<number>} coord2 - [lng2, lat2]
 * @returns {number|null} Distance in km, rounded to 1 decimal place, or null if invalid coordinates.
 */
export const calculateDistanceKm = (coord1, coord2) => {
  if (
    !Array.isArray(coord1) ||
    !Array.isArray(coord2) ||
    coord1.length !== 2 ||
    coord2.length !== 2 ||
    (coord1[0] === 0 && coord1[1] === 0) ||
    (coord2[0] === 0 && coord2[1] === 0)
  ) {
    return null;
  }

  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
};

/**
 * Computes Proximity Score (0 - 100) based on distance in kilometers:
 * - <= 5 km: 100
 * - <= 15 km: 85
 * - <= 30 km: 70
 * - <= 50 km: 50
 * - > 50 km: 25
 * - Coordinates missing but same city: 60
 */
export const getProximityScore = (distanceKm, isSameCity = false) => {
  if (distanceKm === null || distanceKm === undefined) {
    return isSameCity ? 60 : 30;
  }

  if (distanceKm <= 5) return 100;
  if (distanceKm <= 15) return 85;
  if (distanceKm <= 30) return 70;
  if (distanceKm <= 50) return 50;
  return Math.max(10, Math.round(100 - distanceKm * 1.5));
};
