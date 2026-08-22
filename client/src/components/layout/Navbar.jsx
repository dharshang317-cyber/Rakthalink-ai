import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Search,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Activity,
  Layers,
  ChevronDown
} from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import Badge from '../common/Badge';
import useAuth from '../../hooks/useAuth';
import { getUserAvatar } from '../../utils/avatar';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-red-600 bg-red-50/70 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Logo size="default" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" end className={navLinkClasses}>
                Home
              </NavLink>
              <NavLink to="/how-it-works" className={navLinkClasses}>
                How It Works
              </NavLink>
              <NavLink to="/safety" className={navLinkClasses}>
                Safety & Rules
              </NavLink>
              <NavLink to="/about" className={navLinkClasses}>
                About
              </NavLink>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* AI Assistant Quick Pill */}
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>AI Assistant</span>
            </Link>

            {isAuthenticated && user ? (
              /* Authenticated User Menu */
              <div className="relative flex items-center gap-3">
                <Link
                  to="/notifications"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition"
                  >
                    <img
                      src={getUserAvatar(user)}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=dc2626&color=ffffff&bold=true&rounded=true`;
                      }}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                    />
                    <span className="text-xs font-semibold text-slate-700 max-w-[110px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <Badge variant="red" size="sm">
                            Role: {user.role?.toUpperCase() || 'BOTH'}
                          </Badge>
                        </div>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <Activity className="w-4 h-4 text-slate-500" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 rounded-xl"
                        >
                          <Layers className="w-4 h-4 text-purple-600" />
                          Admin Console
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Public / Guest Action Buttons */
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="font-medium"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={HeartHandshake}
                  onClick={() => navigate('/login?mode=register')}
                >
                  Join as Donor
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </NavLink>
            <NavLink
              to="/how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              How It Works
            </NavLink>
            <NavLink
              to="/safety"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Safety & Rules
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              About
            </NavLink>
            <NavLink
              to="/ai-assistant"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50"
            >
              <Sparkles className="w-4 h-4" />
              RakthaLink AI Assistant
            </NavLink>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 rounded-xl bg-slate-900 text-white text-sm font-medium"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-center py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/login');
                  }}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  icon={HeartHandshake}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/login?mode=register');
                  }}
                >
                  Join as Donor
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
