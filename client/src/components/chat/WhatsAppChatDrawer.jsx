import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Check,
  CheckCheck,
  Shield,
  MessageCircle,
  Smile,
  Paperclip,
  Phone,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import useAuth from '../../hooks/useAuth';
import { getUserAvatar } from '../../utils/avatar';

export default function WhatsAppChatDrawer() {
  const { user } = useAuth();
  const {
    activeChatUser,
    isChatOpen,
    closeChat,
    messages,
    isLoadingMessages,
    isSending,
    sendMessage,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText;
    setInputText('');
    await sendMessage(textToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isChatOpen || !activeChatUser) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 z-50 w-[94vw] sm:w-[390px] h-[540px] max-h-[85vh] flex flex-col bg-[#efeae2] rounded-2xl shadow-2xl overflow-hidden border border-slate-300 animate-in slide-in-from-bottom-5 duration-300 font-sans">
      
      {/* 1. WhatsApp Top Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={getUserAvatar({ avatar: activeChatUser.avatar, name: activeChatUser.name })}
              alt={activeChatUser.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChatUser.name || 'User')}&background=128C7E&color=ffffff&bold=true&rounded=true`;
              }}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/40 shadow-xs"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#075E54]"></div>
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate text-white">
              {activeChatUser.name}
            </h3>
            <p className="text-[11px] text-emerald-200 flex items-center gap-1 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Online • RakthaLink Network</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {activeChatUser.bloodGroup && (
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full mr-1">
              {activeChatUser.bloodGroup}
            </span>
          )}
          <button
            onClick={closeChat}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Privacy & Emergency Banner */}
      <div className="bg-[#e7fedb] border-b border-[#c8f7b5] px-3 py-1.5 text-[11px] text-[#1e6118] flex items-center justify-center gap-1.5 shrink-0">
        <Shield className="w-3.5 h-3.5 text-[#168a0e] shrink-0" />
        <span className="truncate">Direct voluntary coordination between donor & requester</span>
      </div>

      {/* 3. Messages Chat Body (WhatsApp Wallpaper aesthetic) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2] bg-radial from-[#ffffff]/40 to-transparent">
        
        {/* Date / Security Notice Pill */}
        <div className="flex justify-center my-1">
          <span className="bg-[#ffffff]/90 text-slate-600 text-[10px] font-semibold px-3 py-1 rounded-lg shadow-2xs border border-slate-200/60">
            🔒 Messages are end-to-end coordinated on RakthaLink AI
          </span>
        </div>

        {isLoadingMessages ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <span className="animate-pulse">Loading chat history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#075E54] flex items-center justify-center mx-auto shadow-xs">
              <MessageCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No messages yet</p>
            <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto">
              Say hello to <strong>{activeChatUser.name}</strong> to coordinate donation timings or hospital details!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
            const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-xs leading-relaxed relative ${
                    isMe
                      ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-[#b4f0aa]'
                      : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200/80'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-500">
                    <span>{timeFormatted}</span>
                    {isMe && (
                      <span title={msg.isRead ? 'Read' : 'Sent'}>
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-[#53bdeb]' : 'text-slate-400'}`} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. WhatsApp Bottom Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-[#f0f2f5] p-2.5 flex items-center gap-2 border-t border-slate-300/80 shrink-0"
      >
        <div className="flex-1 bg-white rounded-full flex items-center px-3.5 py-1.5 border border-slate-300 focus-within:border-emerald-600 shadow-2xs">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full text-xs text-slate-800 focus:outline-none bg-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-md shrink-0 ${
            inputText.trim() && !isSending
              ? 'bg-[#00a884] text-white hover:bg-[#075E54] active:scale-95'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
          title="Send Message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

    </div>
  );
}
