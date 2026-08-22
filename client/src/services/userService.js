import api from './api';

/**
 * Fetches authenticated user's profile and donor statistics.
 */
export const fetchUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Updates basic profile details and role preferences.
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

/**
 * Deactivates user account.
 */
export const deactivateAccount = async () => {
  const response = await api.post('/users/deactivate');
  return response.data;
};
