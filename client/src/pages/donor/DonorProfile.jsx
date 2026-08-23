import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Navigation,
  Clock,
  Save,
  Lock,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BloodBadge from '../../components/common/BloodBadge';
import Spinner from '../../components/common/Spinner';
import AvailabilityToggle from '../../components/donor/AvailabilityToggle';
import useAuth from '../../hooks/useAuth';
import { fetchMyDonorProfile, saveDonorProfile, toggleDonorAvailability } from '../../services/donorService';
import { BLOOD_GROUPS } from '../../utils/constants';

export default function DonorProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const { user, donorProfile: cachedDonorProfile, updateUserProfile } = useAuth();

  const [bloodGroup, setBloodGroup] = useState('O+');
  const [isAvailable, setIsAvailable] = useState(true);
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('in_app');
  const [city, setCity] = useState(user?.city || '');
  const [area, setArea] = useState(user?.area || '');
  const [coordinates, setCoordinates] = useState(null); // [lng, lat]
  const [donationNotes, setDonationNotes] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchMyDonorProfile();
        if (res.success && res.data) {
          const d = res.data;
          setBloodGroup(d.bloodGroup || 'O+');
          setIsAvailable(d.isAvailable !== false);
          setLastDonationDate(d.lastDonationDate ? d.lastDonationDate.split('T')[0] : '');
          setPreferredContactMethod(d.preferredContactMethod || 'in_app');
          setCity(d.city || user?.city || '');
          setArea(d.area || user?.area || '');
          if (d.location?.coordinates && d.location.coordinates[0] !== 0) {
            setCoordinates(d.location.coordinates);
          }
          setDonationNotes(d.donationNotes || '');
        } else if (user) {
          setCity(user.city || '');
          setArea(user.area || '');
        }
      } catch (err) {
        console.error('Error fetching donor profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Calculate days since donation / future scheduled date (90-day recovery standard)
  const getDonationRecoveryStatus = () => {
    if (!lastDonationDate) {
      return { eligible: true, message: 'Ready to donate whenever needed.' };
    }
    const donationTime = new Date(lastDonationDate).getTime();
    const currentTime = Date.now();
    const diffDays = Math.floor((currentTime - donationTime) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysAhead = Math.abs(diffDays);
      return {
        eligible: true,
        daysAhead,
        message: `Scheduled / Planned donation date set for ${daysAhead} day${daysAhead === 1 ? '' : 's'} in the future.`,
      };
    }
    if (diffDays < 90) {
      const daysLeft = 90 - diffDays;
      return {
        eligible: false,
        daysLeft,
        message: `Recovery period: ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining before recommended next whole blood donation.`,
      };
    }
    return {
      eligible: true,
      diffDays,
      message: `Eligible to donate! Last donated ${diffDays} days ago (>90 days gap).`,
    };
  };

  const recovery = getDonationRecoveryStatus();

  // Browser Geolocation auto-detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. You can enter your City and Area manually.');
      return;
    }

    setIsLocating(true);
    setLocationSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = Number(position.coords.longitude.toFixed(5));
        const lat = Number(position.coords.latitude.toFixed(5));
        setCoordinates([lng, lat]);
        setIsLocating(false);
        setLocationSuccessMsg(`Approximate GPS coordinates detected (${lat}, ${lng}). Distance calculations enabled!`);
      },
      (error) => {
        setIsLocating(false);
        alert('Could not access GPS location. Please check browser permissions or enter city manually.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Instant Availability Toggle Handler
  const handleToggleAvailability = async (nextState) => {
    setIsAvailable(nextState);
    try {
      const res = await toggleDonorAvailability(nextState);
      if (res.success) {
        if (cachedDonorProfile) {
          updateUserProfile(user, { ...cachedDonorProfile, isAvailable: nextState });
        }
      }
    } catch (error) {
      // Revert state on failure
      setIsAvailable(!nextState);
      alert('Failed to update availability on server. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    const payload = {
      bloodGroup,
      isAvailable,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      preferredContactMethod,
      city: city.trim(),
      area: area.trim(),
      coordinates,
      donationNotes: donationNotes.trim(),
    };

    try {
      const res = await saveDonorProfile(payload);
      if (res.success) {
        updateUserProfile(user, res.data);
        setSaveSuccess(true);
        setIsSaving(false);

        if (isOnboarding) {
          navigate('/dashboard');
        }
      } else {
        throw new Error(res.message || 'Failed to save donor profile');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || 'Error saving donor profile');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-xs text-slate-500 font-medium">Loading your donor profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Onboarding Welcome Header */}
      {isOnboarding && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 text-white shadow-lg space-y-2 animate-in fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 2 of 2: Donor Preferences & Blood Group</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">
            Configure Your Voluntary Donor Profile
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl">
            Select your blood group, confirm your city for proximity matching, and manage your live availability.
          </p>
        </div>
      )}

      {/* Profile Page Header */}
      {!isOnboarding && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">Voluntary Donor Profile</h1>
              <BloodBadge bloodGroup={bloodGroup} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control your blood group, live matching availability toggle, and donation history.
            </p>
          </div>

          <AvailabilityToggle
            isAvailable={isAvailable}
            onToggle={handleToggleAvailability}
          />
        </div>
      )}

      {/* Success / Error Banners */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Donor profile updated and synced with matching engine!</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Blood Group Selection Card */}
        <Card title="Select Your Blood Group" subtitle="Essential for biological compatibility matching filter">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => {
                    setBloodGroup(bg);
                    setSaveSuccess(false);
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 ${
                    bloodGroup === bg
                      ? 'border-red-600 bg-red-50 text-red-700 shadow-xs font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className="text-2xl font-black font-['Outfit']">{bg}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {bg === 'O-' ? 'Universal Donor' : bg === 'AB+' ? 'Universal Recipient' : 'Standard'}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <strong>Selected Type:</strong> <span className="text-red-600 font-bold">{bloodGroup}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {bloodGroup === 'O-'
                  ? 'Can donate red blood cells to any recipient type (A+, A-, B+, B-, AB+, AB-, O+, O-).'
                  : bloodGroup === 'O+'
                  ? 'Can donate to all positive blood types (A+, B+, AB+, O+).'
                  : `Can donate to ${bloodGroup} and compatible recipient groups.`}
              </span>
            </div>
          </div>
        </Card>

        {/* 2. Live Availability Status */}
        <Card title="Matching Availability" subtitle="Control whether you receive emergency match notifications">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Live Availability Switch</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                When toggled <strong className="text-emerald-700">Available</strong>, the matching engine can recommend you for emergency requests in your city. When <strong className="text-slate-700">Unavailable</strong>, you will remain hidden from matching searches.
              </p>
            </div>

            <AvailabilityToggle
              isAvailable={isAvailable}
              onToggle={handleToggleAvailability}
            />
          </div>
        </Card>

        {/* 3. Location & Proximity Matching */}
        <Card title="Location & Geographic Proximity" subtitle="Used for approximate distance ranking (Haversine formula)">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City / Town <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Coimbatore"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Area / Locality / District
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Gandhipuram / RS Puram"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* GPS Detection Bar */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Geodesic Distance Proximity</span>
                </h5>
                <p className="text-[11px] text-blue-800">
                  {coordinates
                    ? `Captured approximate coordinates: [${coordinates[1]}, ${coordinates[0]}].`
                    : 'Auto-detect coordinates to allow the matching engine to compute accurate kilometer distance to hospitals.'}
                </p>
                {locationSuccessMsg && (
                  <p className="text-[11px] text-emerald-700 font-semibold">{locationSuccessMsg}</p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Navigation}
                loading={isLocating}
                onClick={handleDetectLocation}
                className="shrink-0 text-blue-700 border-blue-200 hover:bg-blue-100/60 bg-white"
              >
                {coordinates ? 'Re-detect GPS' : 'Auto-Detect Coordinates'}
              </Button>
            </div>
          </div>
        </Card>

        {/* 4. Donation History & Recovery Standard */}
        <Card title="Donation History & Health Timing" subtitle="Track your donations and WHO 90-day recovery cycle">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date of Whole Blood Donation / Planned Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Preferred Contact Method Upon Match
                </label>
                <select
                  value={preferredContactMethod}
                  onChange={(e) => setPreferredContactMethod(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                >
                  <option value="in_app">In-App Notification Only (Most Private)</option>
                  <option value="phone">Phone Call / WhatsApp (After Acceptance)</option>
                  <option value="email">Email Notification</option>
                </select>
              </div>
            </div>

            {/* Recovery Alert */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                recovery.eligible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Donation Interval:</strong> {recovery.message}
              </div>
            </div>

            {/* Donation Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={donationNotes}
                onChange={(e) => setDonationNotes(e.target.value)}
                placeholder="e.g. Available primarily on weekday evenings and weekends."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            icon={Save}
            loading={isSaving}
            className="shadow-md"
          >
            {isOnboarding ? 'Complete Setup & Go to Dashboard' : 'Save Donor Profile'}
          </Button>

          <Link
            to="/dashboard"
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

      </form>
    </div>
  );
}
