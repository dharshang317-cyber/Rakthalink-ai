import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchChatMessages,
  sendChatMessage,
  fetchConversations,
  markChatMessagesRead,
} from '../services/chatService';
import useAuth from '../hooks/useAuth';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  // Load conversations and calculate total unread messages
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetchConversations();
      if (res.success && res.data) {
        setConversations(res.data);
        const unreadSum = res.data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setTotalUnread(unreadSum);
      }
    } catch (err) {
      // Non-blocking
    }
  }, [user]);

  // Load messages for the currently active chat partner
  const loadMessages = useCallback(async (recipientId, isPolling = false) => {
    if (!recipientId || !user) return;
    if (!isPolling) setIsLoadingMessages(true);
    try {
      const res = await fetchChatMessages(recipientId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('[LOAD CHAT ERROR]:', err);
    } finally {
      if (!isPolling) setIsLoadingMessages(false);
    }
  }, [user]);

  // Open chat space with a specific user
  const openChat = (targetUser) => {
    if (!targetUser || !targetUser._id) return;
    setActiveChatUser(targetUser);
    setIsChatOpen(true);
    loadMessages(targetUser._id, false);
    // Mark as read in conversations
    markChatMessagesRead(targetUser._id).catch(() => {});
  };

  // Close chat space
  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Send a message in active chat
  const sendMessage = async (text) => {
    if (!activeChatUser || !text.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await sendChatMessage(
        activeChatUser._id,
        text.trim(),
        activeChatUser.matchId || null,
        activeChatUser.requestId || null
      );
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        loadConversations();
        return { success: true };
      }
    } catch (err) {
      console.error('[SEND MESSAGE ERROR]:', err);
      return { success: false, error: err.message };
    } finally {
      setIsSending(false);
    }
  };

  // Background polling for real-time live WhatsApp experience
  useEffect(() => {
    if (!user) return;
    loadConversations();

    const convInterval = setInterval(() => {
      loadConversations();
    }, 12000);

    return () => clearInterval(convInterval);
  }, [user, loadConversations]);

  // Real-time polling when a chat drawer is open
  useEffect(() => {
    if (!isChatOpen || !activeChatUser?._id) return;

    const chatInterval = setInterval(() => {
      loadMessages(activeChatUser._id, true);
    }, 3000);

    return () => clearInterval(chatInterval);
  }, [isChatOpen, activeChatUser, loadMessages]);

  const value = {
    activeChatUser,
    isChatOpen,
    messages,
    conversations,
    isLoadingMessages,
    isSending,
    totalUnread,
    openChat,
    closeChat,
    sendMessage,
    loadMessages,
    loadConversations,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
