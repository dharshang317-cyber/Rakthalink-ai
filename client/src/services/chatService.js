import api from './api';

/**
 * Fetch full conversation history with a specific user
 */
export const fetchChatMessages = async (recipientId) => {
  const response = await api.get(`/chat/messages/${recipientId}`);
  return response.data;
};

/**
 * Send a chat message
 */
export const sendChatMessage = async (recipientId, text, matchId = null, requestId = null) => {
  const response = await api.post('/chat/messages', {
    recipientId,
    text,
    matchId,
    requestId,
  });
  return response.data;
};

/**
 * Fetch all active conversations for the authenticated user
 */
export const fetchConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

/**
 * Mark messages from a specific partner as read
 */
export const markChatMessagesRead = async (recipientId) => {
  const response = await api.patch(`/chat/messages/${recipientId}/read`);
  return response.data;
};
