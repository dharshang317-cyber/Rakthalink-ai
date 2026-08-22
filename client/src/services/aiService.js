import api from './api';

/**
 * Extracts structured blood request fields from natural language text.
 */
export const extractBloodRequest = async (prompt) => {
  const response = await api.post('/ai/request-assistance', { prompt });
  return response.data;
};

/**
 * Sends a conversational message to RakthaLink AI Assistant.
 */
export const sendChatMessage = async (message, history = []) => {
  const response = await api.post('/ai/chat', { message, history });
  return response.data;
};
