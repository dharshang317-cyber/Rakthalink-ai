import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, HeartHandshake, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const redirect = searchParams.get('redirect') || '/dashboard';
  const isRegister = mode === 'register';

  const { loginWithGoogleToken, isLoading, authError, setAuthError } = useAuth();
  const [devEmail, setDevEmail] = useState('');
  const [showDevAuth, setShowDevAuth] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setAuthError('Google did not return an authentication token. Please try again.');
      return;
    }

    const result = await loginWithGoogleToken(credentialResponse.credential);
    if (result.success) {
      // If user profile is newly created or incomplete, navigate to role onboarding in Phase 6
      if (result.isNewUser || !result.user?.isProfileCompleted) {
        navigate('/profile?onboarding=true');
      } else {
        navigate(redirect);
      }
    }
  };

  const handleGoogleError = () => {
    setAuthError('Google Sign-In failed or was cancelled. Please try again.');
  };

  // Helper for quick local development testing without live Google Client ID
  const handleDevLogin = async (e) => {
    e.preventDefault();
    if (!devEmail.trim()) return;
    const testToken = `dev_test_token_${devEmail.trim().toLowerCase()}`;
    const result = await loginWithGoogleToken(testToken);
    if (result.success) {
      navigate(redirect);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>

        {/* Login Box */}
        <Card className="p-8 shadow-xl bg-white/95 border-slate-200">
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {isRegister ? 'Join RakthaLink AI' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isRegister
                ? 'Authenticate with your Google Account to become a donor or submit urgent blood requests.'
                : 'Authenticate with your Google Account to access your donor dashboard and active requests.'}
            </p>
          </div>

          {authError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Authentication Notice:</span> {authError}
              </div>
            </div>
          )}

          {/* Primary Real Google Sign-In Portal */}
          <div className="pt-6 space-y-5">
            <div className="w-full flex justify-center">
              {isLoading ? (
                <div className="py-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Spinner size="sm" color="primary" />
                  <span>Verifying Google account with server...</span>
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text={isRegister ? 'signup_with' : 'signin_with'}
                    width="320"
                  />
                </div>
              )}
            </div>

            {/* Privacy & Security Guarantees */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-slate-500 text-[11px]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Password Storage (Google OAuth 2.0 / OpenID Connect)</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Your contact info is never shared without your mutual consent.</span>
              </div>
            </div>

            {/* Development Mock Authenticator Toggle for Local Testing */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowDevAuth(!showDevAuth)}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                {showDevAuth ? 'Hide Local Test Authenticator' : '⚡ Local Development Test Sign-In'}
              </button>

              {showDevAuth && (
                <form onSubmit={handleDevLogin} className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Test with any custom Google account email:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={devEmail}
                      onChange={(e) => setDevEmail(e.target.value)}
                      placeholder="e.g. user.karthik@gmail.com"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
                    >
                      Sign In
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    * Creates/authenticates a dedicated individual account for testing multi-user flows.
                  </p>
                </form>
              )}
            </div>
          </div>
        </Card>

        {/* Role Notice */}
        <p className="text-center text-xs text-slate-500">
          Want to act as both a donor and requester?{' '}
          <span className="text-slate-700 font-semibold">You can manage both roles from one single account.</span>
        </p>
      </div>
    </div>
  );
}
