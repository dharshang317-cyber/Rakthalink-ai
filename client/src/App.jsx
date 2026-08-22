import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import HowItWorks from './pages/public/HowItWorks';
import Safety from './pages/public/Safety';
import Login from './pages/public/Login';

// App Pages
import AIAssistantPage from './pages/ai/AIAssistantPage';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import DonorProfile from './pages/donor/DonorProfile';
import CreateRequest from './pages/requester/CreateRequest';
import MyRequests from './pages/requester/MyRequests';
import RequestDetails from './pages/requester/RequestDetails';
import MatchesPage from './pages/requester/MatchesPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="safety" element={<Safety />} />
          <Route path="login" element={<Login />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />

          {/* Authenticated Protected Routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="donor/profile"
            element={
              <ProtectedRoute>
                <DonorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests/create"
            element={
              <ProtectedRoute>
                <CreateRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests/my"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests/:id"
            element={
              <ProtectedRoute>
                <RequestDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="matches"
            element={
              <ProtectedRoute>
                <MatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route
            path="*"
            element={
              <div className="py-20 text-center space-y-4">
                <h2 className="text-3xl font-bold text-slate-800">404 - Page Not Found</h2>
                <p className="text-slate-500 text-sm">The page you are looking for does not exist.</p>
                <a href="/" className="inline-block px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium">
                  Return Home
                </a>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
