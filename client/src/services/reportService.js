import api from './api';

/**
 * Submits a safety, misconduct, or fake request report.
 */
export const submitSafetyReport = async (reportData) => {
  const response = await api.post('/reports', reportData);
  return response.data;
};
