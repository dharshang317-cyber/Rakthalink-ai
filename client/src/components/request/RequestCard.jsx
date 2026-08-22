import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Droplet,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Card from '../common/Card';
import BloodBadge from '../common/BloodBadge';
import UrgencyBadge from './UrgencyBadge';
import StatusBadge from './StatusBadge';
import Button from '../common/Button';

export default function RequestCard({
  request,
  onStatusChange,
  showActions = true,
  isOwner = false,
}) {
  const navigate = useNavigate();

  const formattedDate = new Date(request.requiredDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card hover className="overflow-hidden transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3.5">
          <BloodBadge bloodGroup={request.bloodGroup} size="md" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                {request.patientName}
              </h3>
              <UrgencyBadge urgency={request.urgency} size="sm" />
              <StatusBadge status={request.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">{request.hospitalName}</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{request.city} {request.area ? `(${request.area})` : ''}</span>
            </p>
          </div>
        </div>

        {/* Units required indicator */}
        <div className="text-right sm:text-right shrink-0 bg-red-50/60 px-3 py-1.5 rounded-xl border border-red-100">
          <div className="text-sm font-black text-red-700 font-['Outfit']">
            {request.unitsRequired} {request.unitsRequired > 1 ? 'Units' : 'Unit'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Required by {formattedDate}</div>
        </div>
      </div>

      {/* Additional Notes */}
      {request.additionalNotes && (
        <p className="pt-3 text-xs text-slate-600 italic line-clamp-2">
          "{request.additionalNotes}"
        </p>
      )}

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Posted {new Date(request.createdAt).toLocaleDateString()}</span>
          </span>
          {request.matchCount !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              <Users className="w-3 h-3" />
              <span>{request.matchCount} Matches</span>
            </span>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/requests/${request._id}`)}
            >
              Details
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Users}
              onClick={() => navigate(`/matches?requestId=${request._id}`)}
            >
              View Matches
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
