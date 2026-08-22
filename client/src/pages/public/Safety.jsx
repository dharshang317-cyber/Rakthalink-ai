import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileCheck2,
  Building,
  HelpCircle,
  Flag
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function Safety() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="red" size="sm">Safety, Rules & Medical Standards</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Platform Safety & Eligibility Protocols
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Our uncompromising guidelines to protect donor well-being and patient safety.
        </p>
      </div>

      {/* Primary Mandatory Medical Disclaimer */}
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 space-y-2">
        <div className="flex items-center gap-2 text-red-900 font-bold text-base">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          <span>Mandatory Medical Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
          {MEDICAL_DISCLAIMER}
        </p>
      </div>

      {/* General Donor Eligibility (WHO Reference) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-base mb-4 font-['Outfit']">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>General Donor Eligibility Criteria</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>Age between 18 and 65 years old.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>Body weight of at least 45 kg (or hospital-mandated limit).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>Adequate gap since last whole blood donation (minimum 90 days).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>Normal blood pressure and hemoglobin level (≥ 12.5 g/dL verified at blood bank).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>Feeling generally well, well-hydrated, and rested on the donation day.</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 border-rose-200 bg-rose-50/20">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-base mb-4 font-['Outfit']">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>When You Should NOT Donate</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>Currently suffering from flu, fever, infection, or active sore throat.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>Underwent major surgery or dental extraction in the past 6 months.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>Had a tattoo, ear piercing, or acupuncture within the past 6–12 months.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>Pregnant or currently breastfeeding.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>History of hepatitis B/C, HIV, cardiac disease, or blood disorders.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Hospital Blood Bank Protocols */}
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <Building className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">Hospital Blood Bank Cross-Matching</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Blood compatibility matching on RakthaLink AI is an initial logistical estimation. Before any transfusion takes place, the recipient’s hospital laboratory <strong>must perform a full laboratory cross-match test</strong> to guarantee that the donor’s red blood cells are compatible with the recipient’s antibodies.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never perform or accept blood transfers outside of an authorized clinical setting.
            </p>
          </div>
        </div>
      </Card>

      {/* Safety & User Reporting Rules */}
      <Card className="p-8 border-slate-300">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-800 shrink-0">
            <Flag className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">Community Conduct & Reporting</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              RakthaLink AI is strictly a <strong>non-commercial voluntary platform</strong>. Demanding or offering money for blood donations is illegal under national blood safety regulations and will result in immediate account termination and reporting to authorities.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you encounter spam, fake requests, suspicious individuals, or harassment, use the platform's <strong>Report User</strong> feature to trigger an immediate administrative investigation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
