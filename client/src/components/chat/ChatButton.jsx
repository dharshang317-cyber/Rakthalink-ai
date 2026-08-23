import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function ChatButton({
  user,
  matchId = null,
  requestId = null,
  size = 'sm',
  className = '',
  showLabel = false,
}) {
  const { openChat } = useChat();

  if (!user || !user._id) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    openChat({
      _id: user._id,
      name: user.name || 'User',
      avatar: user.avatar || '',
      bloodGroup: user.bloodGroup || '',
      role: user.role || 'donor',
      matchId,
      requestId,
    });
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Chat with ${user.name || 'User'} on WhatsApp-style Chat`}
      className={`inline-flex items-center gap-1.5 font-bold transition rounded-full shadow-xs active:scale-95 border ${
        isSmall
          ? 'p-1.5 text-xs bg-[#25D366] text-white hover:bg-[#128C7E] border-emerald-600/30'
          : 'px-3 py-1.5 text-xs bg-[#25D366] text-white hover:bg-[#128C7E] border-emerald-600/30'
      } ${className}`}
    >
      <MessageCircle className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
      {showLabel && <span>Chat</span>}
    </button>
  );
}
