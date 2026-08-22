import api from './api';

/**
 * Schedules a hospital donation appointment.
 */
export const scheduleAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

/**
 * Fetches all appointments for the authenticated user (donor or requester).
 */
export const fetchMyAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

/**
 * Updates appointment status (CONFIRMED, COMPLETED, CANCELLED).
 */
export const updateAppointmentStatus = async (id, status, cancellationReason = '') => {
  const response = await api.patch(`/appointments/${id}/status`, { status, cancellationReason });
  return response.data;
};

/**
 * Fetches shared mutual contact information for an accepted match.
 */
export const fetchSharedContact = async (matchId) => {
  const response = await api.get(`/appointments/match/${matchId}/contact`);
  return response.data;
};
