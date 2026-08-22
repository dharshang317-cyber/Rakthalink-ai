import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import BloodBadge from '../common/BloodBadge';
import UrgencyBadge from '../request/UrgencyBadge';
import Spinner from '../common/Spinner';
import { extractBloodRequest } from '../../services/aiService';
import { postBloodRequest } from '../../services/requestService';

export default function AIRequestExtractorModal({ isOpen, onClose, onExtractedData }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsExtracting(true);
    setErrorMessage('');
    setExtractedResult(null);

    try {
      const res = await extractBloodRequest(inputText.trim());
      if (res.success && res.data?.extracted) {
        setExtractedResult(res.data.extracted);
      } else {
        throw new Error('Could not structure request from provided text.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'AI extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmAndPost = async () => {
    if (!extractedResult) return;
    setIsPosting(true);
    try {
      const res = await postBloodRequest(extractedResult);
      if (res.success && res.data) {
        onClose();
        navigate(`/matches?requestId=${res.data._id}`);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to publish extracted request.');
      setIsPosting(false);
    }
  };

  const handleEditInForm = () => {
    if (extractedResult && onExtractedData) {
      onExtractedData(extractedResult);
      onClose();
    }
  };

  const samplePrompts = [
    'I need 2 units of O positive blood at KMCH Hospital Coimbatore tomorrow for surgery.',
    'Urgent emergency: 1 unit of A- blood required at Apollo Hospital Chennai today.',
    'Need 3 units of B+ at Ganga Medical Center Coimbatore next Monday.',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                AI-Assisted Blood Request Extractor
              </h3>
              <p className="text-[11px] text-slate-500">
                Type in natural conversational English. The AI structures verified fields for your confirmation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Text Form */}
        {!extractedResult && (
          <form onSubmit={handleExtract} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Describe Your Blood Need:
              </label>
              <textarea
                rows={3}
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. 'I need two units of O positive blood at KMCH Hospital Coimbatore tomorrow morning for a planned cardiac procedure.'"
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            {/* Quick Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Or try a sample prompt:</span>
              <div className="flex flex-col gap-1.5">
                {samplePrompts.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setInputText(p)}
                    className="text-left text-[11px] text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100/80 p-2 rounded-lg transition"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Sparkles}
                loading={isExtracting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Extract Request with AI
              </Button>
            </div>
          </form>
        )}

        {/* Structured JSON Review & Confirmation Box */}
        {extractedResult && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>AI Understood Your Request!</strong> Please review the extracted parameters below before confirming.
              </span>
            </div>

            {/* Extracted Fields Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Patient / Case:</span>
                <span className="font-bold text-slate-900">{extractedResult.patientName}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Blood Group:</span>
                <BloodBadge bloodGroup={extractedResult.bloodGroup} size="sm" />
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Units Required:</span>
                <span className="font-extrabold text-red-600 font-['Outfit'] text-sm">
                  {extractedResult.unitsRequired} Units
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Hospital Facility:</span>
                <span className="font-bold text-slate-800">{extractedResult.hospitalName}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">City & Locality:</span>
                <span className="font-bold text-slate-800">
                  {extractedResult.city} {extractedResult.area ? `(${extractedResult.area})` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Required Date:</span>
                <span className="font-bold text-slate-800">{extractedResult.requiredDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Urgency Priority:</span>
                <UrgencyBadge urgency={extractedResult.urgency} size="sm" />
              </div>
            </div>

            {/* Explicit Confirmation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditInForm}
              >
                Edit in Standard Form
              </Button>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExtractedResult(null)}
                >
                  Try Again
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  loading={isPosting}
                  onClick={handleConfirmAndPost}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm & Find Donors
                </Button>
              </div>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
