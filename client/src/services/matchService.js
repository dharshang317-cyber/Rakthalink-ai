import api from './api';

/**
 * Fetches ranked voluntary donor matches for a specific blood request.
 */
export const fetchMatchesForRequest = async (requestId) => {
  const response = await api.get(`/matches/${requestId}`);
  return response.data;
};

/**
 * Sends a notification request to a matched voluntary donor.
 */
export const sendMatchNotification = async (matchId) => {
  const response = await api.post(`/matches/${matchId}/send-request`);
  return response.data;
};

/**
 * Donor responds (ACCEPT / DECLINE) to a match request.
 */
export const respondToMatchRequest = async (matchId, action, notes = '') => {
  const response = await api.post(`/matches/${matchId}/respond`, { action, notes });
  return response.data;
};
