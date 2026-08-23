import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Heart,
  ExternalLink,
  CheckCheck,
  ShieldAlert,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ChatButton from '../../components/chat/ChatButton';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';
import { respondToMatchRequest } from '../../services/matchService';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDonorResponse = async (matchId, action, notificationId) => {
    setRespondingId(matchId);
    try {
      const res = await respondToMatchRequest(matchId, action);
      if (res.success) {
        await markNotificationRead(notificationId);
        setActionSuccessMsg(
          action === 'ACCEPT'
            ? '🎉 Thank you! You have accepted the request. Mutual contact details and appointment coordination are now unlocked.'
            : 'Request declined. The requester will be notified.'
        );
        loadNotifications();
        setTimeout(() => setActionSuccessMsg(''), 6000);
      }
    } catch (error) {
      alert('Failed to respond to request.');
    } finally {
      setRespondingId(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MATCH_FOUND':
      case 'REQUEST_RECEIVED':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'REQUEST_ACCEPTED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'REQUEST_DECLINED':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_UPDATED':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">Notifications & Alerts</h1>
            {unreadCount > 0 && (
              <Badge variant="red" size="sm">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time alerts for blood match requests, donor acceptances, and appointment coordination.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Spinner size="lg" color="primary" />
          <p className="text-xs text-slate-500 font-medium">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">No notifications yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              When a compatible request matches your donor profile or an appointment is scheduled, you will be notified here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`p-5 transition ${
                !n.isRead ? 'bg-white border-l-4 border-l-red-600 shadow-xs' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()} at{' '}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  {/* Interactive Donor Decision Actions for MATCH_FOUND notifications */}
                  {n.type === 'MATCH_FOUND' && n.relatedId && (
                    <div className="mt-3 p-3.5 rounded-xl bg-red-50/70 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="text-xs text-slate-700">
                        <strong>Voluntary Decision:</strong> Are you willing and available to donate for this patient?
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Heart}
                          loading={respondingId === n.relatedId}
                          onClick={() => handleDonorResponse(n.relatedId, 'ACCEPT', n._id)}
                        >
                          Accept Request
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={respondingId === n.relatedId}
                          onClick={() => handleDonorResponse(n.relatedId, 'DECLINE', n._id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* General Action Links */}
                  <div className="pt-2 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline"
                        >
                          Mark as read
                        </button>
                      )}
                      {n.senderId && (
                        <ChatButton
                          user={n.senderId}
                          size="sm"
                          showLabel
                          className="py-1 px-2.5 text-[11px]"
                        />
                      )}
                    </div>

                    {n.actionLink && n.type !== 'MATCH_FOUND' && (
                      <Link
                        to={n.actionLink}
                        onClick={() => handleMarkRead(n._id)}
                        className="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 ml-auto"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
