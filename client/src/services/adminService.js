import api from './api';

/**
 * 1. 📊 Platform Overview Metrics & Analytics
 */
export const fetchAdminMetrics = async () => {
  const response = await api.get('/admin/metrics');
  return response.data;
};

/**
 * 2. 👥 User Management
 */
export const fetchAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const toggleBlockUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/block`);
  return response.data;
};

export const updateRole = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

/**
 * 3. 🩸 Donor Management
 */
export const fetchAdminDonors = async (params = {}) => {
  const response = await api.get('/admin/donors', { params });
  return response.data;
};

export const toggleDonorAvailability = async (id) => {
  const response = await api.patch(`/admin/donors/${id}/availability`);
  return response.data;
};

/**
 * 4. 🏥 Blood Request Management
 */
export const fetchAdminRequests = async (params = {}) => {
  const response = await api.get('/admin/requests', { params });
  return response.data;
};

export const updateRequestStatusAdmin = async (id, status) => {
  const response = await api.patch(`/admin/requests/${id}/status`, { status });
  return response.data;
};

/**
 * 5. 🔗 Match Monitoring
 */
export const fetchAdminMatches = async () => {
  const response = await api.get('/admin/matches');
  return response.data;
};

/**
 * 6. 🔔 System Announcements Broadcast
 */
export const broadcastSystemAnnouncement = async (payload) => {
  const response = await api.post('/admin/announcements/broadcast', payload);
  return response.data;
};

/**
 * 7. 🚨 Safety Reports Management
 */
export const fetchAdminReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

export const resolveAdminReport = async (id, payload) => {
  const response = await api.patch(`/admin/reports/${id}`, payload);
  return response.data;
};

/**
 * 8. 🤖 AI Monitoring
 */
export const fetchAIMonitoringStats = async () => {
  const response = await api.get('/admin/ai-stats');
  return response.data;
};

/**
 * 9 & 10. ⚙️ Platform Settings
 */
export const fetchPlatformSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updatePlatformSettings = async (payload) => {
  const response = await api.put('/admin/settings', payload);
  return response.data;
};
