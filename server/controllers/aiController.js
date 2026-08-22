import { extractStructuredRequest, generateConversationalReply } from '../services/aiService.js';
import AIConversation from '../models/AIConversation.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   POST /api/ai/request-assistance
 * @desc    Extract structured blood request fields from natural language text
 * @access  Private / Public
 */
export const extractRequestFromText = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return sendError(res, 400, 'Please provide natural language text describing your blood request.');
    }

    const result = await extractStructuredRequest(prompt.trim());

    return sendSuccess(res, 200, 'Natural language blood request structured successfully', {
      extracted: result.data,
      source: result.source,
      userConfirmationRequired: true,
    });
  } catch (error) {
    console.error('[AI REQUEST EXTRACTION ERROR]:', error);
    return sendError(res, 500, 'Failed to extract structured request fields.');
  }
};

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with RakthaLink AI Assistant with medical safety guardrails
 * @access  Public / Private
 */
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendError(res, 400, 'Please provide a message string.');
    }

    const result = await generateConversationalReply(message.trim(), history || []);

    // If user is authenticated, log conversation
    if (req.user) {
      try {
        let conversation = await AIConversation.findOne({ userId: req.user._id });
        if (!conversation) {
          conversation = new AIConversation({ userId: req.user._id, messages: [] });
        }
        conversation.messages.push(
          { sender: 'user', text: message.trim() },
          { sender: 'assistant', text: result.reply }
        );
        // Keep last 30 messages
        if (conversation.messages.length > 30) {
          conversation.messages = conversation.messages.slice(-30);
        }
        await conversation.save();
      } catch (logErr) {
        console.warn('Could not persist chat history:', logErr.message);
      }
    }

    return sendSuccess(res, 200, 'AI response generated', {
      reply: result.reply,
      source: result.source,
    });
  } catch (error) {
    console.error('[AI CHAT ERROR]:', error);
    return sendError(res, 500, 'AI Assistant service encountered an error.');
  }
};
