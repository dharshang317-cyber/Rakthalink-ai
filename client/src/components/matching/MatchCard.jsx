import React, { useState } from 'react';
import {
  Heart,
  Navigation,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import Card from '../common/Card';
import BloodBadge from '../common/BloodBadge';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ScoreGauge from './ScoreGauge';

export default function MatchCard({ match, onSendRequest }) {
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(match.status === 'REQUESTED' || match.status === 'ACCEPTED');

  const handleSend = async () => {
    if (requestSent || sending) return;
    setSending(true);
    try {
      await onSendRequest(match.matchId);
      setRequestSent(true);
    } catch (error) {
      alert('Failed to send request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card hover className="p-5 border-slate-200 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        
        {/* Donor Avatar & Information */}
        <div className="flex items-start gap-3.5">
          <div className="relative">
            <img
              src={match.donorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={match.donorName}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">
                {match.donorName}
              </h4>
              <BloodBadge bloodGroup={match.donorBloodGroup} size="sm" />
              {match.isExactMatch ? (
                <Badge variant="emerald" size="sm">Exact Match</Badge>
              ) : (
                <Badge variant="blue" size="sm">Compatible Type</Badge>
              )}
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">{match.distanceDisplay}</span>
              <span>•</span>
              <span className="text-slate-500">{match.city} {match.area ? `(${match.area})` : ''}</span>
            </p>
          </div>
        </div>

        {/* Platform Match Score Gauge */}
        <div className="sm:text-right shrink-0">
          <ScoreGauge score={match.matchScore} size="md" />
          <div className="text-[10px] text-slate-400 mt-1">Platform Match Score</div>
        </div>

      </div>

      {/* Score Factor Breakdown Pills */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Available for Matching</span>
          </span>
          {match.totalDonations > 0 && (
            <span className="text-slate-400">
              • {match.totalDonations} Past Donations
            </span>
          )}
        </div>

        {/* Action Button */}
        <div>
          {match.status === 'ACCEPTED' ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Donor Accepted!</span>
            </span>
          ) : requestSent || match.status === 'REQUESTED' ? (
            <span className="inline-flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Request Sent</span>
            </span>
          ) : (
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              loading={sending}
              onClick={handleSend}
            >
              Send Request
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
