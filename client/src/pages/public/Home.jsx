import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Search,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Users,
  Activity,
  Calendar,
  Lock
} from 'lucide-react';
import Button from '../../components/common/Button';
import BloodBadge from '../../components/common/BloodBadge';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import { BLOOD_GROUPS, MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function Home({ user }) {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const compatibilityMap = {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+ (Universal Recipient)'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['Universal Donor: All Blood Groups'],
  };

  const handleAction = (destination) => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(destination));
    } else {
      navigate(destination);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-red-50/70 via-white to-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold tracking-tight border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>AI-Assisted Emergency & Voluntary Blood Matching</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Find Potential Blood Donors <span className="text-red-600">Faster.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                RakthaLink AI connects voluntary blood donors with individuals in urgent need using natural-language request parsing, geodesic location ranking, and privacy-first coordination.
              </p>

              {/* Primary Call To Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  icon={Search}
                  onClick={() => handleAction('/requests/create')}
                  className="w-full sm:w-auto shadow-md hover:shadow-lg"
                >
                  Find Blood (Post Request)
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  icon={Heart}
                  onClick={() => handleAction('/donor/profile')}
                  className="w-full sm:w-auto"
                >
                  Become a Voluntary Donor
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Google Verified Accounts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>Privacy-Protected Numbers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>AI Request Extraction</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Compatibility Card */}
            <div className="lg:col-span-5">
              <Card className="border-red-100 shadow-xl bg-white/95" hover={false}>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-slate-900 font-['Outfit']">Interactive Blood Group Tool</h3>
                  </div>
                  <Badge variant="red" size="sm">Quick Reference</Badge>
                </div>

                <div className="pt-4 space-y-4">
                  <p className="text-xs text-slate-500">
                    Select a blood group to view which recipients this blood can potentially help:
                  </p>

                  {/* Blood Group Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        key={bg}
                        onClick={() => setSelectedGroup(bg)}
                        className={`p-2.5 rounded-xl text-center text-sm font-bold transition font-['Outfit'] ${
                          selectedGroup === bg
                            ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                            : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>

                  {/* Compatibility Info Display */}
                  <div className="p-4 rounded-xl bg-red-50/70 border border-red-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Donor Type:</span>
                      <span className="text-sm font-extrabold text-red-700 font-['Outfit']">{selectedGroup}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-800">Can donate to:</strong>{' '}
                      {Array.isArray(compatibilityMap[selectedGroup])
                        ? compatibilityMap[selectedGroup].join(', ')
                        : compatibilityMap[selectedGroup]}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 text-center leading-tight">
                    * General biological reference. Final cross-matching must be verified at the hospital blood bank.
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="text-3xl font-extrabold text-red-600 font-['Outfit']">100%</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Voluntary Platform</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">&lt; 30s</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Smart Match Ranking</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="text-3xl font-extrabold text-emerald-600 font-['Outfit']">Zero</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Public Phone Exposure</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="text-3xl font-extrabold text-purple-600 font-['Outfit']">24/7</div>
            <div className="text-xs text-slate-500 font-medium mt-1">AI Request Support</div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="red" size="sm">Simple & Reliable</Badge>
          <h2 className="text-3xl font-bold text-slate-900">How RakthaLink AI Coordinates Help</h2>
          <p className="text-sm text-slate-600">
            A seamless, transparent multi-user coordination cycle from emergency request to hospital donation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative p-6" hover>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-base mb-4 font-['Outfit']">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Google Login</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Authenticate securely with your real Google account. No insecure passwords or hardcoded fake users.
            </p>
          </Card>

          <Card className="relative p-6" hover>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-base mb-4 font-['Outfit']">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Post Blood Need</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use standard fields or type in natural language. Our backend AI extracts blood group, location, units, and urgency.
            </p>
          </Card>

          <Card className="relative p-6" hover>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-base mb-4 font-['Outfit']">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Smart Match Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              The engine ranks available donors by distance, blood compatibility, and urgency, giving a transparent Platform Match Score.
            </p>
          </Card>

          <Card className="relative p-6" hover>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-base mb-4 font-['Outfit']">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Secure Coordination</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Donors accept voluntarily. Once accepted, contact is unlocked to schedule the hospital blood bank visit.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Engineered for Reliability & Privacy</h2>
            <p className="text-sm text-slate-600">Built with modern health-tech standards and zero compromise on user safety.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover className="bg-white">
              <div className="p-3 w-fit rounded-xl bg-red-50 text-red-600 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">AI-Assisted Request Builder</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Requesters can describe their urgent need in plain conversational English. The AI parses structured units, location, and dates for explicit review.
              </p>
            </Card>

            <Card hover className="bg-white">
              <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Privacy-Protected Sharing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Donor phone numbers and exact home addresses are never published publicly. Only approximate distances and consented contacts are displayed.
              </p>
            </Card>

            <Card hover className="bg-white">
              <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Hospital Coordination Log</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log appointment time slots, hospital blood bank locations, and donation status updates in a centralized dashboard.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. MEDICAL DISCLAIMER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900">Mandatory Medical Notice</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {MEDICAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <Card className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-8 sm:p-12 border-none shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Be the reason someone smiles again.
          </h2>
          <p className="text-red-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Join the RakthaLink AI network today. Register as a voluntary donor or find immediate help when every second counts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              icon={Heart}
              onClick={() => handleAction('/donor/profile')}
              className="bg-white text-slate-900 hover:bg-slate-100 border-none shadow-md font-semibold"
            >
              Register as Donor
            </Button>
            <Button
              size="lg"
              variant="outline"
              icon={Sparkles}
              onClick={() => navigate('/ai-assistant')}
              className="bg-red-700/60 text-white border-red-400 hover:bg-red-700 shadow-md font-semibold"
            >
              Ask AI Assistant
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
