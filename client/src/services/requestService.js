import api from './api';

/**
 * Creates a new blood request.
 */
export const postBloodRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data;
};

/**
 * Fetches blood requests created by authenticated user.
 */
export const fetchMyBloodRequests = async () => {
  const response = await api.get('/requests/user/me');
  return response.data;
};

/**
 * Fetches public active blood requests with optional filters.
 */
export const fetchPublicBloodRequests = async (params = {}) => {
  const response = await api.get('/requests', { params });
  return response.data;
};

/**
 * Fetches a single blood request by ID.
 */
export const fetchBloodRequestById = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

/**
 * Updates blood request details.
 */
export const updateBloodRequest = async (id, data) => {
  const response = await api.put(`/requests/${id}`, data);
  return response.data;
};

/**
 * Updates blood request status (OPEN, RESOLVED, CANCELLED, etc.).
 */
export const updateBloodRequestStatus = async (id, status) => {
  const response = await api.patch(`/requests/${id}/status`, { status });
  return response.data;
};

/**
 * Cancels a blood request.
 */
export const deleteBloodRequest = async (id) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};
