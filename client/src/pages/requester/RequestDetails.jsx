import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Edit,
  Trash2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BloodBadge from '../../components/common/BloodBadge';
import UrgencyBadge from '../../components/request/UrgencyBadge';
import StatusBadge from '../../components/request/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { fetchBloodRequestById, updateBloodRequestStatus } from '../../services/requestService';
import { MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetchBloodRequestById(id);
      if (res.success) {
        setRequest(res.data);
      } else {
        setErrorMessage('Request not found.');
      }
    } catch (err) {
      setErrorMessage('Failed to load blood request details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await updateBloodRequestStatus(id, newStatus);
      if (res.success) {
        setRequest((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-xs text-slate-500 font-medium">Loading blood request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Blood Request Not Found</h2>
        <p className="text-xs text-slate-500">{errorMessage || 'The requested blood record does not exist.'}</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'OPEN', label: 'Request Published' },
    { key: 'MATCHED', label: 'Donors Matched' },
    { key: 'ACCEPTED', label: 'Donor Accepted' },
    { key: 'IN_COORDINATION', label: 'In Coordination' },
    { key: 'RESOLVED', label: 'Fulfilled' },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === request.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-start gap-4">
          <BloodBadge bloodGroup={request.bloodGroup} size="lg" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                {request.patientName}
              </h1>
              <UrgencyBadge urgency={request.urgency} size="sm" />
              <StatusBadge status={request.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Request ID: <span className="font-mono text-slate-700">{request._id}</span>
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Users}
          onClick={() => navigate(`/matches?requestId=${request._id}`)}
          className="shadow-md"
        >
          View Matched Donors
        </Button>
      </div>

      {/* Lifecycle Progress Stepper */}
      <Card title="Request Lifecycle Timeline">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {steps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border text-center transition ${
                  isCurrent
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div className="text-xs font-['Outfit']">{step.label}</div>
                <div className="text-[10px] mt-0.5">
                  {isCurrent ? 'Current' : isCompleted ? '✓ Completed' : 'Pending'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Hospital & Logistics">
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-slate-500">Hospital / Facility:</span>
                <p className="font-bold text-slate-800 text-sm">{request.hospitalName}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-slate-500">City & Location:</span>
                <p className="font-bold text-slate-800">{request.city} {request.area ? `(${request.area})` : ''}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-slate-500">Required Date:</span>
                <p className="font-bold text-slate-800">
                  {new Date(request.requiredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Requirement Summary">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Blood Group:</span>
              <span className="font-extrabold text-red-600 font-['Outfit'] text-sm">{request.bloodGroup}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Units Required:</span>
              <span className="font-extrabold text-slate-900">{request.unitsRequired} Units</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Urgency:</span>
              <span className="font-bold uppercase text-slate-800">{request.urgency}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Clinical Notes */}
      {request.additionalNotes && (
        <Card title="Clinical Notes & Instructions">
          <p className="text-xs text-slate-700 leading-relaxed italic">
            "{request.additionalNotes}"
          </p>
        </Card>
      )}

      {/* Medical Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Mandatory Medical Notice:</strong> {MEDICAL_DISCLAIMER}
        </p>
      </div>

      {/* Status Transition Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {request.status !== 'RESOLVED' && (
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleStatusUpdate('RESOLVED')}
            >
              Mark Request as Resolved
            </Button>
          )}
          {request.status !== 'CANCELLED' && request.status !== 'RESOLVED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStatusUpdate('CANCELLED')}
            >
              Cancel Request
            </Button>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Users}
          onClick={() => navigate(`/matches?requestId=${request._id}`)}
        >
          View Matched Donors
        </Button>
      </div>
    </div>
  );
}
