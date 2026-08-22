import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Search,
  Bell,
  Calendar,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Layers,
  Crown
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BloodBadge from '../../components/common/BloodBadge';
import useAuth from '../../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, donorProfile } = useAuth();

  // Active view tab for users who selected "both"
  const [activeTab, setActiveTab] = useState(user?.role === 'requester' ? 'requester' : 'donor');

  const isBoth = user?.role === 'both';
  const isAdmin = user?.role === 'admin';
  const showDonorView = user?.role === 'donor' || (isBoth && activeTab === 'donor') || isAdmin;
  const showRequesterView = user?.role === 'requester' || (isBoth && activeTab === 'requester') || isAdmin;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Portal Alert Shortcut */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-800 text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Platform Administrator Mode</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-700 text-[10px] text-amber-300 font-bold uppercase">
                  {user?.email}
                </span>
              </h4>
              <p className="text-[11px] text-purple-200">
                You have full access to User Moderation, Donor Management, Match Monitoring, Reports, Broadcasts, and Settings.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={Layers}
            onClick={() => navigate('/admin')}
            className="shrink-0 text-xs bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
          >
            Open Admin Suite
          </Button>
        </div>
      )}

      {/* Incomplete Profile Alert Prompt */}
      {user && !user.isProfileCompleted && !isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Your profile is not yet completed</h4>
              <p className="text-[11px] text-amber-800">
                Please configure your city, area, and contact details to enable nearby matching alerts.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/profile?onboarding=true')}
            className="shrink-0 text-xs"
          >
            Complete Profile Now
          </Button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                Role: {user?.role?.toUpperCase() || 'MEMBER'}
              </span>
              {user?.city && (
                <span className="text-xs text-red-100 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {user.city} {user.area ? `(${user.area})` : ''}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Welcome, {user?.name || 'RakthaLink Member'}!
            </h1>
            <p className="text-xs text-red-100">
              Intelligent blood donor and request coordination dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="glass"
              size="sm"
              icon={Layers}
              onClick={() => navigate('/admin')}
            >
              Admin Console
            </Button>
          )}
          <Button
            variant="glass"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/ai-assistant')}
          >
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Role View Switcher for Dual-Role Members */}
      {isBoth && (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-100 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 pl-3">Active Dashboard View:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('donor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'donor'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Donor Mode</span>
            </button>
            <button
              onClick={() => setActiveTab('requester')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'requester'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Requester Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-5 cursor-pointer" onClick={() => navigate('/requests/create')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Post Blood Need</h4>
              <p className="text-[11px] text-slate-500">Create urgent blood request</p>
            </div>
          </div>
        </Card>

        <Card hover className="p-5 cursor-pointer" onClick={() => navigate('/donor/profile')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Donor Profile</h4>
              <p className="text-[11px] text-slate-500">
                {donorProfile ? `Blood: ${donorProfile.bloodGroup}` : 'Manage blood group & availability'}
              </p>
            </div>
          </div>
        </Card>

        <Card hover className="p-5 cursor-pointer" onClick={() => navigate('/notifications')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
              <p className="text-[11px] text-slate-500">View real-time match alerts</p>
            </div>
          </div>
        </Card>

        <Card hover className="p-5 cursor-pointer" onClick={() => navigate('/appointments')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Appointments</h4>
              <p className="text-[11px] text-slate-500">Hospital coordination history</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dynamic Role Views */}
      {showDonorView && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            title="Potential Nearby Blood Requests"
            className="lg:col-span-2"
            subtitle="Emergency requests matching your blood group in your area"
          >
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h5 className="font-semibold text-slate-700 text-sm">No Urgent Requests Matching Right Now</h5>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                When a hospital or requester creates a compatible blood request in your area, you will receive an alert right here.
              </p>
            </div>
          </Card>

          <Card title="Donor Availability Status" subtitle="Live toggle for matching engine">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      donorProfile?.isAvailable !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  ></span>
                  <span className="text-xs font-bold text-slate-800">
                    Status: {donorProfile?.isAvailable !== false ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <Badge variant={donorProfile?.isAvailable !== false ? 'emerald' : 'neutral'} size="sm">
                  {donorProfile?.isAvailable !== false ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When toggled Available, the matching engine can recommend you for compatible emergency requests in your area.
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/donor/profile')}>
                Edit Donor Preferences
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showRequesterView && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            title="My Active Blood Requests"
            className="lg:col-span-2"
            subtitle="Requests you have posted for patients"
            action={
              <Button size="sm" variant="primary" icon={Search} onClick={() => navigate('/requests/create')}>
                Post Request
              </Button>
            }
          >
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h5 className="font-semibold text-slate-700 text-sm">No Active Blood Requests</h5>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Need blood for surgery or emergency transfusion? Create a request to match nearby voluntary donors.
              </p>
              <Button size="sm" variant="primary" icon={Search} onClick={() => navigate('/requests/create')}>
                Post a Blood Request
              </Button>
            </div>
          </Card>

          <Card title="AI Request Assistant" subtitle="Natural language request parser">
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Instant Natural Language Structuring</span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                Describe your blood requirement in natural words (e.g. <em>"Need 2 units of O+ blood at Ganga Hospital Coimbatore tomorrow"</em>) and the AI will structure the fields for your review.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/ai-assistant')}
              >
                Open AI Assistant
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
