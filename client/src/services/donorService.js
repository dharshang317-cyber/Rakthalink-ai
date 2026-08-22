import api from './api';

/**
 * Fetches the authenticated user's donor profile.
 */
export const fetchMyDonorProfile = async () => {
  const response = await api.get('/donors/profile');
  return response.data;
};

/**
 * Creates or updates the authenticated user's donor profile.
 */
export const saveDonorProfile = async (donorData) => {
  const response = await api.post('/donors/profile', donorData);
  return response.data;
};

/**
 * Toggles donor live availability (true = available for matching, false = paused).
 */
export const toggleDonorAvailability = async (isAvailable) => {
  const response = await api.put('/donors/availability', { isAvailable });
  return response.data;
};

/**
 * Searches public voluntary donors with privacy redaction.
 */
export const searchVoluntaryDonors = async (params = {}) => {
  const response = await api.get('/donors/search', { params });
  return response.data;
};
