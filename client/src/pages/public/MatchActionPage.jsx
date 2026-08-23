import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Calendar,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Logo from '../../components/common/Logo';
import { respondViaEmailAction } from '../../services/matchService';
import { useChat } from '../../context/ChatContext';

export default function MatchActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openChat } = useChat();

  const matchId = searchParams.get('matchId');
  const action = searchParams.get('action'); // 'ACCEPT' or 'DECLINE'
  const donorId = searchParams.get('donorId');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processAction = async () => {
      if (!matchId || !action) {
        setErrorMessage('Invalid or missing request action link parameters.');
        setLoading(false);
        return;
      }

      try {
        const res = await respondViaEmailAction(matchId, action, donorId);
        if (res.success) {
          setResult(res.data);
        } else {
          setErrorMessage(res.message || 'Could not process request action.');
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to update request response.';
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    processAction();
  }, [matchId, action, donorId]);

  const isAccepted = action === 'ACCEPT';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Logo size="lg" />
        </div>

        <Card className="p-8 shadow-xl bg-white border-slate-200 text-center">
          {loading ? (
            <div className="py-12 space-y-4">
              <Spinner size="lg" color="primary" />
              <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
                Processing your decision...
              </h3>
              <p className="text-xs text-slate-500">
                Updating match status and notifying the requester...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                Action Notice
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {errorMessage}
              </p>
              <div className="pt-4">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {isAccepted ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                      🎉 Request Accepted!
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                      Thank you for volunteering! The blood requester has been notified by email and notification.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 text-left space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Next Steps for Coordination</span>
                    </div>
                    <p className="text-[11px] leading-normal text-emerald-700">
                      You can now coordinate timings directly using our real-time <strong>WhatsApp-style Chat</strong> or schedule an appointment at the hospital blood bank.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to="/appointments">
                      <Button variant="primary" size="md" icon={Calendar}>
                        View Appointments
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="outline" size="md">
                        Donor Dashboard
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                    <XCircle className="w-9 h-9 text-slate-500" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
                      Request Canceled
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                      You have canceled this match request. The requester has been notified so they can connect with other active voluntary donors.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Link to="/">
                      <Button variant="outline" size="md">
                        Return to Homepage
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
