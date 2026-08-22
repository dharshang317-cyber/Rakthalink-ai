import React from 'react';
import { ShieldCheck, Heart, Sparkles, Cpu, Users, Award, Lock, FileText } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="red" size="sm">Academic Final-Year Project</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          About RakthaLink AI
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          An AI-assisted voluntary blood donor discovery and request coordination platform developed as a Final-Year B.Sc. Information Technology project.
        </p>
      </div>

      {/* Purpose & Motivation */}
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 shrink-0">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">Project Purpose & Motivation</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every day, families and patients face emergency blood shortages where critical minutes are lost searching across scattered WhatsApp groups, social media feeds, and calling friends. 
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>RakthaLink AI</strong> was engineered to solve this coordination problem. It centralizes voluntary donors, verifies authentic accounts through Google OAuth 2.0, calculates realistic approximate distances using mathematical formulas, and provides an AI assistant to parse natural language requests into structured, actionable notifications.
            </p>
          </div>
        </div>
      </Card>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="p-6">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">Smart Matching Engine</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Combines biological blood compatibility filters with Haversine geodesic distance calculations and urgency multipliers to present a transparent 0-100 Platform Match Score.
          </p>
        </Card>

        <Card hover className="p-6">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 w-fit mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">Server-Side AI Gateway</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The LLM integration is secured behind Express middleware with zero frontend key exposure, extracting structured JSON parameters and answering general blood donation FAQs with strict safety guardrails.
          </p>
        </Card>

        <Card hover className="p-6">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">Privacy & Anti-Spam</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Protects voluntary donors from spam calls and harassment by withholding phone numbers and precise street locations until a request is explicitly accepted.
          </p>
        </Card>
      </div>

      {/* Strict Medical Boundaries */}
      <Card className="p-8 border-amber-200 bg-amber-50/40">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-amber-950">Ethical & Medical Boundaries</h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-amber-900 leading-relaxed">
              <li>RakthaLink AI is a <strong>technological facilitator</strong>, not a medical diagnosis or healthcare provider.</li>
              <li>The application does <strong>NOT</strong> authorize transfusions, test biological compatibility, or medically certify donor fitness.</li>
              <li>All donor screenings, hemoglobin tests, infectious disease screenings, and cross-matching must be conducted by licensed hospital blood banks.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
