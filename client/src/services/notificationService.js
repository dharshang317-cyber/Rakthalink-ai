import api from './api';

/**
 * Fetches notifications and unread count for authenticated user.
 */
export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Marks a single notification as read.
 */
export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Marks all notifications as read.
 */
export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};
