import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Navigation,
  CheckCircle2,
  Droplet,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BloodBadge from '../../components/common/BloodBadge';
import AIRequestExtractorModal from '../../components/ai/AIRequestExtractorModal';
import useAuth from '../../hooks/useAuth';
import { postBloodRequest } from '../../services/requestService';
import { BLOOD_GROUPS, MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsRequired: 2,
    hospitalName: '',
    city: user?.city || '',
    area: user?.area || '',
    requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    urgency: 'high',
    additionalNotes: '',
    coordinates: null, // [lng, lat]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleBloodGroupSelect = (bg) => {
    setFormData((prev) => ({ ...prev, bloodGroup: bg }));
  };

  const handleUrgencySelect = (urgencyLevel) => {
    setFormData((prev) => ({ ...prev, urgency: urgencyLevel }));
  };

  const handleDetectHospitalGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGpsSuccessMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = Number(position.coords.longitude.toFixed(5));
        const lat = Number(position.coords.latitude.toFixed(5));
        setFormData((prev) => ({ ...prev, coordinates: [lng, lat] }));
        setIsLocating(false);
        setGpsSuccessMessage(`Hospital GPS coordinates recorded (${lat}, ${lng}).`);
      },
      (error) => {
        setIsLocating(false);
        alert('Could not access GPS. Please check browser permissions.');
      },
      { timeout: 10000 }
    );
  };

  const handleApplyAIExtracted = (extracted) => {
    setFormData((prev) => ({
      ...prev,
      patientName: extracted.patientName || prev.patientName,
      bloodGroup: extracted.bloodGroup || prev.bloodGroup,
      unitsRequired: extracted.unitsRequired || prev.unitsRequired,
      hospitalName: extracted.hospitalName || prev.hospitalName,
      city: extracted.city || prev.city,
      area: extracted.area || prev.area,
      requiredDate: extracted.requiredDate || prev.requiredDate,
      urgency: extracted.urgency || prev.urgency,
      additionalNotes: extracted.additionalNotes || prev.additionalNotes,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await postBloodRequest(formData);
      if (res.success && res.data) {
        navigate(`/matches?requestId=${res.data._id}`);
      } else {
        throw new Error(res.message || 'Failed to create blood request');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || 'Error submitting blood request');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">Post a Blood Need Request</h1>
            <Badge variant="red" size="sm">Emergency / Scheduled</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit patient and hospital details to trigger our Smart Matching Engine for nearby voluntary donors.
          </p>
        </div>

        {/* AI Assistant Quick Modal Trigger */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Sparkles}
          onClick={() => setIsAIModalOpen(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
        >
          Use AI Natural Language Extractor
        </Button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Patient & Blood Group Selection */}
        <Card title="Patient Details & Blood Group Needed" subtitle="Select the exact blood group prescribed by the hospital">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="e.g. Meena Sundaram"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
              />
            </div>

            {/* Blood Group Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Required Blood Group <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => handleBloodGroupSelect(bg)}
                    className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 ${
                      formData.bloodGroup === bg
                        ? 'border-red-600 bg-red-50 text-red-700 font-extrabold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-semibold'
                    }`}
                  >
                    <span className="text-xl font-bold font-['Outfit']">{bg}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Units Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Units of Blood Required: <span className="text-red-600 font-extrabold">{formData.unitsRequired} Units</span>
                </label>
                <span className="text-[11px] text-slate-400">Standard whole blood / PRBC units</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                name="unitsRequired"
                value={formData.unitsRequired}
                onChange={handleChange}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1">
                <span>1 Unit</span>
                <span>3 Units</span>
                <span>5 Units</span>
                <span>10 Units</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Hospital & Location Information */}
        <Card title="Hospital Location & Time Requirement" subtitle="Where the voluntary donor will report for blood donation">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hospital / Blood Bank Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. KMCH Hospital / Apollo Speciality Hospital"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
            </div>

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
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Coimbatore"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Area / Street Locality
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Avinashi Road / Peelamedu"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date When Blood is Needed <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    name="requiredDate"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.requiredDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Hospital GPS Auto-Detector */}
              <div className="flex flex-col justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={Navigation}
                  loading={isLocating}
                  onClick={handleDetectHospitalGPS}
                  className="w-full text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  {formData.coordinates ? 'Hospital GPS Recorded' : 'Auto-Detect Hospital GPS'}
                </Button>
                {gpsSuccessMessage && (
                  <p className="text-[10px] text-emerald-600 mt-1 font-semibold">{gpsSuccessMessage}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Urgency Selection */}
        <Card title="Request Urgency Level" subtitle="Requester-selected priority level for matching notifications">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Normal */}
            <div
              onClick={() => handleUrgencySelect('normal')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${
                formData.urgency === 'normal'
                  ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs font-['Outfit']">
                <Clock className="w-3.5 h-3.5" />
                <span>Normal Priority</span>
              </div>
              <p className="text-[11px] text-slate-500">Needed within 48-72 hours (e.g. planned procedure).</p>
            </div>

            {/* High Priority */}
            <div
              onClick={() => handleUrgencySelect('high')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${
                formData.urgency === 'high'
                  ? 'border-amber-500 bg-amber-50/60 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs font-['Outfit']">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>High Priority</span>
              </div>
              <p className="text-[11px] text-slate-500">Needed within 24 hours (scheduled surgery / urgency).</p>
            </div>

            {/* Critical Emergency */}
            <div
              onClick={() => handleUrgencySelect('urgent')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 relative ${
                formData.urgency === 'urgent'
                  ? 'border-red-600 bg-red-50/70 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-extrabold uppercase animate-pulse">
                Emergency
              </span>
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs font-['Outfit']">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Critical / Emergency</span>
              </div>
              <p className="text-[11px] text-slate-500">Immediate trauma / acute medical requirement.</p>
            </div>

          </div>
        </Card>

        {/* 4. Additional Instructions */}
        <Card title="Additional Clinical Notes (Optional)">
          <textarea
            rows={2}
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="e.g. Patient admitted in ICU Ward 4. Contact relative at reception for hospital cross-matching slip."
            className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
          />
        </Card>

        {/* Mandatory Medical Safety Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Mandatory Medical Notice:</strong> {MEDICAL_DISCLAIMER}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            icon={Search}
            loading={isSubmitting}
            className="shadow-md"
          >
            Post Request & Find Matching Donors
          </Button>

          <Link
            to="/dashboard"
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Link>
        </div>

      </form>

      {/* AI Request Extractor Modal */}
      <AIRequestExtractorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onExtractedData={handleApplyAIExtracted}
      />
    </div>
  );
}
