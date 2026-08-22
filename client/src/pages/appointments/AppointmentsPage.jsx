import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Plus,
  AlertCircle,
  X,
  FileText,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BloodBadge from '../../components/common/BloodBadge';
import Spinner from '../../components/common/Spinner';
import useAuth from '../../hooks/useAuth';
import {
  fetchMyAppointments,
  scheduleAppointment,
  updateAppointmentStatus,
  fetchSharedContact,
} from '../../services/appointmentService';
import { fetchMyBloodRequests } from '../../services/requestService';
import { MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [myAcceptedRequests, setMyAcceptedRequests] = useState([]);
  const [modalForm, setModalForm] = useState({
    requestId: '',
    matchId: '',
    hospitalName: '',
    hospitalAddress: '',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 12:00 PM',
    coordinationNotes: '',
  });
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMyAppointments();
      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setActionSuccessMsg(`Appointment marked as ${newStatus}`);
        loadAppointments();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleOpenScheduleModal = async () => {
    setShowScheduleModal(true);
    setModalError('');
    try {
      const res = await fetchMyBloodRequests();
      if (res.success) {
        const accepted = res.data.filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_COORDINATION' || r.status === 'MATCHED');
        setMyAcceptedRequests(accepted);
        if (accepted.length > 0) {
          setModalForm((prev) => ({
            ...prev,
            requestId: accepted[0]._id,
            hospitalName: accepted[0].hospitalName || '',
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingModal(true);
    setModalError('');

    try {
      // Find matchId if available or use standard appointment payload
      const payload = {
        ...modalForm,
        matchId: modalForm.matchId || modalForm.requestId, // Fallback to requestId reference
      };

      const res = await scheduleAppointment(payload);
      if (res.success) {
        setShowScheduleModal(false);
        setActionSuccessMsg('Donation coordination appointment scheduled successfully!');
        loadAppointments();
        setTimeout(() => setActionSuccessMsg(''), 5000);
      } else {
        throw new Error(res.message || 'Failed to schedule appointment');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Error scheduling appointment');
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (activeFilter === 'ALL') return true;
    return appt.status === activeFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
              Hospital Donation Appointments & Coordination
            </h1>
            <Badge variant="blue" size="sm">Coordination Log</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log time slots, coordinate hospital blood bank visits, and view unlocked mutual contact information.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenScheduleModal}
          className="shadow-md"
        >
          Schedule Appointment
        </Button>
      </div>

      {/* Success Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Spinner size="lg" color="primary" />
          <p className="text-xs text-slate-500 font-medium">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} appointments scheduled
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once a voluntary donor accepts your blood request, you can schedule a hospital donation visit right here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredAppointments.map((appt) => {
            const isDonor = appt.donorId?._id?.toString() === user?._id?.toString();
            const otherParty = isDonor ? appt.requesterId : appt.donorId;

            return (
              <Card key={appt._id} hover className="p-6 border-slate-200 space-y-4">
                
                {/* Appointment Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-red-50 text-red-600 font-black font-['Outfit'] text-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                          {appt.hospitalName}
                        </h3>
                        <Badge
                          variant={
                            appt.status === 'COMPLETED'
                              ? 'emerald'
                              : appt.status === 'CONFIRMED'
                              ? 'blue'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {appt.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Patient: <strong>{appt.requestId?.patientName || 'Medical Case'}</strong></span>
                        <span>•</span>
                        <span>Blood: <strong>{appt.requestId?.bloodGroup || '--'}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Scheduled Slot Badge */}
                  <div className="text-right sm:text-right bg-blue-50/70 border border-blue-200 px-3.5 py-1.5 rounded-xl">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{new Date(appt.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium">{appt.timeSlot}</div>
                  </div>
                </div>

                {/* Unlocked Mutual Contact Box */}
                {otherParty && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={otherParty.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={otherParty.name}
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-300"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                          Unlocked Contact ({isDonor ? 'Requester' : 'Voluntary Donor'}):
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{otherParty.name}</h4>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {otherParty.phone && (
                        <a
                          href={`tel:${otherParty.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 transition shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{otherParty.phone}</span>
                        </a>
                      )}
                      {otherParty.email && (
                        <a
                          href={`mailto:${otherParty.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-medium hover:bg-emerald-100 transition shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{otherParty.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {appt.coordinationNotes && (
                  <p className="text-xs text-slate-600 italic">
                    <strong>Coordination Notes:</strong> "{appt.coordinationNotes}"
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {appt.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle2}
                          onClick={() => handleStatusChange(appt._id, 'COMPLETED')}
                        >
                          Mark as Completed (Donated)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(appt._id, 'CANCELLED')}
                          className="text-rose-600 border-rose-200"
                        >
                          Cancel Visit
                        </Button>
                      </>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Created on {new Date(appt.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </Card>
            );
          })}
        </div>
      )}

      {/* Mandatory Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Mandatory Notice:</strong> This appointment is logged for peer-to-peer timing coordination. All donor physical checkups, hemoglobin tests, and biological compatibility cross-matches are executed exclusively by the hospital's certified blood bank team.
        </p>
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                  Schedule Hospital Donation Visit
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hospital / Blood Bank Facility <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.hospitalName}
                  onChange={(e) => setModalForm({ ...modalForm, hospitalName: e.target.value })}
                  placeholder="e.g. KMCH Hospital Blood Bank, Coimbatore"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Scheduled Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={modalForm.scheduledDate}
                    onChange={(e) => setModalForm({ ...modalForm, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Preferred Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalForm.timeSlot}
                    onChange={(e) => setModalForm({ ...modalForm, timeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="08:00 AM - 10:00 AM">Morning (08:00 AM - 10:00 AM)</option>
                    <option value="10:00 AM - 12:00 PM">Mid-Day (10:00 AM - 12:00 PM)</option>
                    <option value="12:00 PM - 02:00 PM">Afternoon (12:00 PM - 02:00 PM)</option>
                    <option value="02:00 PM - 04:00 PM">Evening (02:00 PM - 04:00 PM)</option>
                    <option value="04:00 PM - 07:00 PM">Late Evening (04:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Coordination Notes / Hospital Instructions
                </label>
                <textarea
                  rows={2}
                  value={modalForm.coordinationNotes}
                  onChange={(e) => setModalForm({ ...modalForm, coordinationNotes: e.target.value })}
                  placeholder="e.g. Please meet relative at Block B reception with ID proof for cross-match."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isSubmittingModal}
                >
                  Confirm Appointment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
