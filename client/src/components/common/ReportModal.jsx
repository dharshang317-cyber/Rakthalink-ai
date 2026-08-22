import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { submitSafetyReport } from '../../services/reportService';

export default function ReportModal({
  isOpen,
  onClose,
  reportedUserId = null,
  reportedRequestId = null,
  reportedName = 'this user/request',
}) {
  const [category, setCategory] = useState('COMMERCIAL_SELLING');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const categories = [
    { value: 'COMMERCIAL_SELLING', label: 'Commercial Blood Selling / Demanding Money (Strictly Prohibited)' },
    { value: 'FAKE_REQUEST', label: 'Fake or Misleading Blood Request' },
    { value: 'HARASSMENT', label: 'Harassment, Abusive Calls, or Spam' },
    { value: 'MISLEADING_INFO', label: 'Incorrect Blood Type or Inaccurate Location' },
    { value: 'OTHER', label: 'Other Safety Concern' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await submitSafetyReport({
        reportedUserId,
        reportedRequestId,
        category,
        description: description.trim(),
      });

      if (res.success) {
        setSuccessMsg('Thank you. Your report has been submitted to platform administrators for investigation.');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 2500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit safety report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                Submit Confidential Safety Report
              </h3>
              <p className="text-[11px] text-slate-500">
                Reporting {reportedName}. Reports are investigated by platform administrators.
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

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Report Violation Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Detailed Description / Evidence <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, including any phone demands, false information, or suspicious behavior..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500">
              🔒 <strong>Voluntary Safety Protection:</strong> RakthaLink AI maintains a strict zero-tolerance policy against commercial blood selling, fraud, and harassment.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                icon={Send}
                loading={isSubmitting}
              >
                Submit Report
              </Button>
            </div>
          </form>
        )}

      </Card>
    </div>
  );
}
