import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from './Spinner';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-xs text-slate-500 font-medium">Verifying authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check role authorization if specified
  if (allowedRoles.length > 0) {
    const userRole = user?.role;
    const isAuthorized =
      allowedRoles.includes(userRole) ||
      (userRole === 'both' && (allowedRoles.includes('donor') || allowedRoles.includes('requester')));

    if (!isAuthorized) {
      return (
        <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            🚫
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">
            Your current account role does not have permission to view this section.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </a>
        </div>
      );
    }
  }

  return children;
}
