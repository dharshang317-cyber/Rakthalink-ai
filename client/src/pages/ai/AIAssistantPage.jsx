import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  Clock,
  Heart,
  Droplet,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import AIRequestExtractorModal from '../../components/ai/AIRequestExtractorModal';
import { sendChatMessage } from '../../services/aiService';
import { MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '👋 Hello! I am the RakthaLink AI Assistant. I can help you understand blood compatibility rules, explain donor eligibility guidelines, navigate the platform, or structure urgent requests. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || isTyping) return;

    const userMsgObj = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Build history for context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await sendChatMessage(text.trim(), history);
      if (res.success && res.data?.reply) {
        const botMsgObj = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsgObj]);
      }
    } catch (error) {
      const errorMsgObj = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I apologize, but I am having trouble connecting right now. Please check your connection or try asking again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsgObj]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleQuestions = [
    {
      title: 'How does matching work?',
      prompt: 'How does the RakthaLink 0-100 Platform Match Score work?',
      icon: Heart,
    },
    {
      title: 'Donor Eligibility',
      prompt: 'What are the general donor eligibility criteria?',
      icon: HelpCircle,
    },
    {
      title: 'Universal Blood Types',
      prompt: 'Which blood types are universal donors and universal recipients?',
      icon: Droplet,
    },
    {
      title: 'Structure a Blood Need',
      action: () => setIsAIModalOpen(true),
      prompt: 'Need help posting an urgent request in natural language',
      icon: Sparkles,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">RakthaLink AI Assistant</h1>
              <Badge variant="purple" size="sm">Knowledge & Guidance</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask questions about blood compatibility, donor guidelines, or use AI natural language request structuring.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Sparkles}
          onClick={() => setIsAIModalOpen(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
        >
          Structure Blood Need
        </Button>
      </div>

      {/* Suggested Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sampleQuestions.map((q, idx) => {
          const Icon = q.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                if (q.action) q.action();
                else handleSendMessage(q.prompt);
              }}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs text-left transition flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-purple-700 transition">
                <Icon className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{q.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                "{q.prompt}"
              </p>
            </button>
          );
        })}
      </div>

      {/* Chat Conversation Box */}
      <Card className="flex flex-col h-[520px] p-0 border-slate-200 overflow-hidden shadow-md">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[10px] mt-2 font-medium ${
                      isBot ? 'text-slate-400' : 'text-red-100'
                    } text-right`}
                  >
                    {m.time}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Loader */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <Spinner size="sm" color="primary" />
                <span>RakthaLink AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question or describe a blood need..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition font-medium"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              loading={isTyping}
              className="bg-purple-600 hover:bg-purple-700 shrink-0"
            >
              Send
            </Button>
          </form>
        </div>
      </Card>

      {/* Mandatory Medical Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Mandatory AI & Medical Safety Notice:</strong> {MEDICAL_DISCLAIMER} The AI assistant provides general public educational information and data structuring assistance. It does not provide medical diagnoses or replace licensed clinical advice.
        </p>
      </div>

      {/* AI Request Extractor Modal */}
      <AIRequestExtractorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onExtractedData={(extracted) => {
          navigate('/requests/create');
        }}
      />
    </div>
  );
}
