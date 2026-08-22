import React from 'react';
import {
  LogIn,
  UserCheck,
  FileSpreadsheet,
  Cpu,
  Bell,
  CheckCircle,
  Building2,
  Lock,
  ArrowDown
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Google OAuth 2.0 Authentication',
      icon: LogIn,
      color: 'bg-blue-50 text-blue-600',
      description:
        'Users log in securely using their personal Google Account. No manual passwords are created or stored on our servers. Each user gets their own dedicated profile and role permissions.',
    },
    {
      num: '02',
      title: 'Role & Profile Configuration',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600',
      description:
        'Choose whether to act as a Voluntary Donor, a Blood Requester, or Both. Donors specify their blood group, general city/area, last donation date, and live Availability toggle (🟢 Available / 🔴 Unavailable).',
    },
    {
      num: '03',
      title: 'Blood Request Creation (Standard or AI-Assisted)',
      icon: FileSpreadsheet,
      color: 'bg-purple-50 text-purple-600',
      description:
        'Requesters submit patient details, hospital name, units needed, and urgency level. Alternatively, they can speak or type in natural language to our AI Assistant, which structures the fields for user confirmation.',
    },
    {
      num: '04',
      title: 'Smart Matching Engine Ranking',
      icon: Cpu,
      color: 'bg-red-50 text-red-600',
      description:
        'The backend applies medical compatibility rules, computes geodesic distance using the Haversine formula, and generates a transparent 0-100 Platform Match Score to prioritize the most suitable nearby donors.',
    },
    {
      num: '05',
      title: 'Notification & Donor Decision',
      icon: Bell,
      color: 'bg-amber-50 text-amber-600',
      description:
        'Matched donors receive immediate platform notifications. The donor reviews the hospital location, required units, and urgency before deciding to voluntarily Accept or Decline.',
    },
    {
      num: '06',
      title: 'Privacy-Gated Mutual Contact Sharing',
      icon: Lock,
      color: 'bg-slate-100 text-slate-700',
      description:
        'Private phone numbers and contact details are kept strictly locked until the donor explicitly accepts the request. Once mutual consent is established, direct contact is authorized.',
    },
    {
      num: '07',
      title: 'Hospital Donation Coordination',
      icon: Building2,
      color: 'bg-rose-50 text-rose-600',
      description:
        'Both parties coordinate an appointment at the licensed hospital blood bank. The hospital handles laboratory cross-matching, donor vitals check, and safe collection.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="red" size="sm">Step-by-Step Workflow</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How RakthaLink AI Works
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          A transparent, safety-focused journey from urgent blood request to life-saving hospital coordination.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Card key={step.num} hover className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-2xl text-red-600/70 font-['Outfit'] w-8">
                    {step.num}
                  </span>
                  <div className={`p-3 rounded-2xl ${step.color} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg font-['Outfit']">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
