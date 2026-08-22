import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowLeft,
  Building2,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BloodBadge from '../../components/common/BloodBadge';
import Spinner from '../../components/common/Spinner';
import MatchCard from '../../components/matching/MatchCard';
import UrgencyBadge from '../../components/request/UrgencyBadge';
import { fetchMatchesForRequest, sendMatchNotification } from '../../services/matchService';
import { fetchMyBloodRequests } from '../../services/requestService';
import { MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function MatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('requestId');

  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [myRequestsList, setMyRequestsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'distance' | 'exact'
  const [notificationMsg, setNotificationMsg] = useState('');

  // 1. Fetch available requests or specific request matches
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (requestId) {
          const res = await fetchMatchesForRequest(requestId);
          if (res.success) {
            setRequest(res.data.request);
            setMatches(res.data.matches || []);
          }
        } else {
          // If no specific requestId in URL, fetch user's requests to let them choose
          const reqRes = await fetchMyBloodRequests();
          if (reqRes.success && reqRes.data?.length > 0) {
            setMyRequestsList(reqRes.data);
            // Auto select the first open request
            const firstOpen = reqRes.data.find((r) => r.status === 'OPEN' || r.status === 'MATCHED') || reqRes.data[0];
            setSearchParams({ requestId: firstOpen._id });
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [requestId, setSearchParams]);

  const handleSendDonorRequest = async (matchId) => {
    const res = await sendMatchNotification(matchId);
    if (res.success) {
      setNotificationMsg('Notification sent to voluntary donor! They will be alerted on their dashboard.');
      setTimeout(() => setNotificationMsg(''), 5000);
    }
  };

  // Sort matches dynamically
  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === 'distance') {
      const distA = a.distanceKm !== null ? a.distanceKm : 9999;
      const distB = b.distanceKm !== null ? b.distanceKm : 9999;
      return distA - distB;
    }
    if (sortBy === 'exact') {
      if (a.isExactMatch && !b.isExactMatch) return -1;
      if (!a.isExactMatch && b.isExactMatch) return 1;
      return b.matchScore - a.matchScore;
    }
    return b.matchScore - a.matchScore;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Request Selector if user has multiple requests */}
      {myRequestsList.length > 1 && (
        <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-2xl">
          <span className="text-xs font-bold text-slate-600 pl-2">Matching For Request:</span>
          <select
            value={requestId || ''}
            onChange={(e) => setSearchParams({ requestId: e.target.value })}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {myRequestsList.map((r) => (
              <option key={r._id} value={r._id}>
                {r.patientName} ({r.bloodGroup}, {r.unitsRequired} Units at {r.hospitalName})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Header Request Summary Card */}
      {request && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-xs font-black text-2xl font-['Outfit'] border border-white/20">
                {request.bloodGroup}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase">
                    Active Match Engine
                  </span>
                  <UrgencyBadge urgency={request.urgency} size="sm" className="bg-white/20 text-white border-white/30" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
                  Potential Donors for {request.patientName}
                </h1>
                <p className="text-xs text-red-100 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{request.hospitalName}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{request.city} {request.area ? `(${request.area})` : ''}</span>
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 bg-white/10 p-3 rounded-xl border border-white/20 text-xs">
              <span className="text-red-100 block">Units Needed:</span>
              <span className="text-xl font-black text-white font-['Outfit']">{request.unitsRequired} Units</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {notificationMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Matching Stats & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-bold text-slate-900">
            {matches.length} {matches.length === 1 ? 'Donor Match' : 'Potential Donor Matches'} Found
          </span>
          {matches.length > 0 && (
            <Badge variant="purple" size="sm">
              Top Match Score: {sortedMatches[0]?.matchScore}/100
            </Badge>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
          >
            <option value="score">Highest Match Score (Recommended)</option>
            <option value="distance">Nearest Distance (Proximity)</option>
            <option value="exact">Exact Blood Group Match First</option>
          </select>
        </div>
      </div>

      {/* Matches List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Spinner size="lg" color="primary" />
          <p className="text-xs text-slate-500 font-medium">Running Smart Matching Algorithm...</p>
        </div>
      ) : sortedMatches.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              No matching voluntary donors available right now
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our matching engine is actively scanning for donors who match the required blood group and city. When a new voluntary donor registers or becomes available, they will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedMatches.map((matchItem) => (
            <MatchCard
              key={matchItem.matchId}
              match={matchItem}
              onSendRequest={handleSendDonorRequest}
            />
          ))}
        </div>
      )}

      {/* Transparent Algorithm Scoring Explanation */}
      <Card title="How the Platform Match Score is Calculated" subtitle="Transparent 4-Factor Logistical Weighting Model">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex justify-between">
              <span>Proximity</span>
              <span className="text-red-600 font-extrabold font-['Outfit']">40%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Calculates real geodesic distance via the Haversine formula to prioritize nearby donors.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex justify-between">
              <span>Blood Suitability</span>
              <span className="text-red-600 font-extrabold font-['Outfit']">35%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Exact blood match earns 100%; compatible alternative type receives 80%.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex justify-between">
              <span>Donation Recency</span>
              <span className="text-red-600 font-extrabold font-['Outfit']">15%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Full points awarded for donors with &gt;90 days since their last donation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex justify-between">
              <span>Urgency Factor</span>
              <span className="text-red-600 font-extrabold font-['Outfit']">10%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Normalizes priority based on requester's selected clinical urgency timeline.
            </p>
          </div>
        </div>
      </Card>

      {/* Mandatory Medical Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Medical Notice:</strong> The Platform Match Score is an operational coordination rating and does NOT represent biological cross-matching certainty. Certified laboratory cross-matching must be conducted at the hospital blood bank prior to transfusion.
        </p>
      </div>

    </div>
  );
}
