import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Heart,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Lock,
  Save,
  Trash2,
  Sparkles
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import useAuth from '../../hooks/useAuth';
import { updateUserProfile, deactivateAccount } from '../../services/userService';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const { user, donorProfile, updateUserProfile: setAuthUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    area: user?.area || '',
    role: user?.role || 'both',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        area: user.area || '',
        role: user.role || 'both',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const res = await updateUserProfile(formData);
      if (res.success && res.data.user) {
        setAuthUser(res.data.user, res.data.donorProfile);
        setSaveSuccess(true);
        setIsSaving(false);

        // If in onboarding flow, forward to donor profile setup or dashboard
        if (isOnboarding) {
          if (formData.role === 'donor' || formData.role === 'both') {
            navigate('/donor/profile?onboarding=true');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || 'Error updating profile');
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateAccount();
      alert('Your account has been deactivated. You will now be logged out.');
      await logout();
      navigate('/');
    } catch (error) {
      alert('Failed to deactivate account. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Onboarding Welcome Header */}
      {isOnboarding && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 text-white shadow-lg space-y-2 animate-in fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 1 of 2: Account & Role Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">
            Welcome to RakthaLink AI, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl">
            Please select how you would like to participate and provide your city and contact details so nearby voluntary matches can be coordinated.
          </p>
        </div>
      )}

      {/* Profile Page Title */}
      {!isOnboarding && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">Account & Profile Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your personal details, platform role, and privacy settings.</p>
          </div>
          <Badge variant="red" size="md">
            Role: {user?.role?.toUpperCase() || 'MEMBER'}
          </Badge>
        </div>
      )}

      {/* Success / Error Banners */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your profile details have been saved successfully!</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Google Account Identity Card */}
        <Card title="Google Account Information" subtitle="Verified via Google OAuth 2.0 (Read-Only)">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="font-bold text-slate-900 text-base">{user?.name}</h3>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  Verified
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Account created on: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* 2. Role Selection (Donor, Requester, Both) */}
        <Card title="Platform Role Selection" subtitle="Choose how you wish to interact with RakthaLink AI">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Voluntary Donor */}
            <div
              onClick={() => handleRoleSelect('donor')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col items-start gap-2 ${
                formData.role === 'donor'
                  ? 'border-red-600 bg-red-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Voluntary Donor</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Receive match notifications when emergency blood requests occur near you.
              </p>
            </div>

            {/* Blood Requester */}
            <div
              onClick={() => handleRoleSelect('requester')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col items-start gap-2 ${
                formData.role === 'requester'
                  ? 'border-red-600 bg-red-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Blood Requester</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Post urgent patient requests and search for nearby compatible voluntary donors.
              </p>
            </div>

            {/* Both (Recommended) */}
            <div
              onClick={() => handleRoleSelect('both')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col items-start gap-2 relative ${
                formData.role === 'both'
                  ? 'border-red-600 bg-red-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase">
                Recommended
              </span>
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Both (Flexible)</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Maintain an active donor profile while retaining full ability to post blood requests.
              </p>
            </div>

          </div>
        </Card>

        {/* 3. Personal & Contact Details */}
        <Card title="Contact & Location Information" subtitle="Used strictly for matching and authorized coordination">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Arun Kumar"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                City / Town <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Coimbatore"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Area / District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Area / Locality
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Gandhipuram / RS Puram"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
            </div>

          </div>

          {/* Privacy Security Note */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-600 text-xs">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Privacy Guarantee:</strong> Your phone number and exact locality are never exposed in public search results. Contact details are only unlocked after mutual request acceptance.
            </p>
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
            {isOnboarding ? 'Continue to Next Step' : 'Save Changes'}
          </Button>

          {!isOnboarding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={() => setShowDeactivateModal(true)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Deactivate Account
            </Button>
          )}
        </div>

      </form>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-lg">Deactivate Account?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deactivating your account will pause all donor notifications, remove you from matching searches, and log you out. You can reactivate anytime simply by signing back in with your Google account.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeactivate}
              >
                Confirm Deactivation
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
