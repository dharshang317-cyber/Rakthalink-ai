import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, ExternalLink, Sparkles, PhoneCall } from 'lucide-react';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      {/* Emergency Healthcare Notice Banner */}
      <div className="bg-gradient-to-r from-red-950/60 via-red-900/40 to-slate-950 border-b border-red-900/40 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-red-200">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Emergency Notice:</strong> If you are experiencing an acute life-threatening emergency, call emergency services (e.g. 112 / 108) or visit your nearest licensed hospital trauma center immediately.
            </span>
          </div>
          <Link
            to="/safety"
            className="inline-flex items-center gap-1 text-red-300 hover:text-white underline shrink-0 font-medium"
          >
            Read Safety Protocols <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="default" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              RakthaLink AI is an intelligent coordination platform built to bridge voluntary blood donors with individuals in urgent need of blood transfusions. Built on safety, transparency, and ethical AI assistance.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
              <strong className="text-slate-200">Medical Safety Disclaimer:</strong> This application is a donor discovery & coordination facilitator. It does not diagnose patients, medically certify donors, or authorize transfusions. All biological testing & cross-matching must be performed by certified blood banks.
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 font-['Outfit']">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition">
                  How Matching Works
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition">
                  Safety & Eligibility Guidelines
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About the Project
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  RakthaLink AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & Final Year Project Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 font-['Outfit']">
              Academic Project
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">
                <span className="font-semibold text-slate-300">Degree:</span> Final Year B.Sc. IT
              </li>
              <li className="text-slate-400">
                <span className="font-semibold text-slate-300">Architecture:</span> MERN Stack + LLM Gateway
              </li>
              <li className="text-slate-400">
                <span className="font-semibold text-slate-300">Auth:</span> Google OAuth 2.0 / OpenID Connect
              </li>
              <li className="text-slate-400">
                <span className="font-semibold text-slate-300">Privacy:</span> Privacy-Gated Mutual Consent
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-medium text-slate-300">
            © 2026 | Developed by Dharshan G
          </p>
          <div className="flex items-center gap-2 text-slate-500">
            <span>RakthaLink AI</span>
            <span>•</span>
            <span>Connecting Blood. Connecting Lives.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
