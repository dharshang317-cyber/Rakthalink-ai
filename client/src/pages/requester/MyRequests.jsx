import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Activity, Users, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import RequestCard from '../../components/request/RequestCard';
import { fetchMyBloodRequests, updateBloodRequestStatus } from '../../services/requestService';

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMyBloodRequests();
      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching blood requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await updateBloodRequestStatus(id, newStatus);
      if (res.success) {
        setActionSuccessMsg(`Request marked as ${newStatus}`);
        loadRequests();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (error) {
      alert('Failed to update request status.');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">My Blood Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage patient blood requests, view potential matches, and update lifecycle statuses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => navigate('/requests/create')}
          className="shadow-md"
        >
          Post New Request
        </Button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {['ALL', 'OPEN', 'MATCHED', 'IN_COORDINATION', 'RESOLVED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeFilter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests Grid / List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Spinner size="lg" color="primary" />
          <p className="text-xs text-slate-500 font-medium">Loading your blood requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} requests found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no blood requests matching this filter. Create a request to find compatible voluntary donors.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/requests/create')}
          >
            Post a Blood Request
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((reqItem) => (
            <div key={reqItem._id} className="space-y-2">
              <RequestCard request={reqItem} isOwner={true} />
              
              {/* Quick Status Modifiers */}
              {reqItem.status === 'OPEN' && (
                <div className="flex justify-end gap-2 pr-1">
                  <button
                    onClick={() => handleStatusUpdate(reqItem._id, 'RESOLVED')}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                  >
                    ✓ Mark as Fulfilled / Resolved
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(reqItem._id, 'CANCELLED')}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition"
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
