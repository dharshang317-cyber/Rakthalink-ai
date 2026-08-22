import api from './api';

/**
 * Sends Google ID token to the backend for cryptographic verification and session creation.
 */
export const googleLogin = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

/**
 * Fetches the currently authenticated user and their donor profile.
 */
export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Informs backend of logout.
 */
export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    return { success: true };
  }
};
