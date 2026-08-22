import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Heart,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  Eye,
  FileText,
  Activity,
  Calendar,
  Building2,
  TrendingUp,
  RefreshCw,
  Bell,
  Sliders,
  Settings,
  Bot,
  Layers,
  Send,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BloodBadge from '../../components/common/BloodBadge';
import Spinner from '../../components/common/Spinner';
import { getUserAvatar } from '../../utils/avatar';
import UrgencyBadge from '../../components/request/UrgencyBadge';
import StatusBadge from '../../components/request/StatusBadge';
import ScoreGauge from '../../components/matching/ScoreGauge';
import useAuth from '../../hooks/useAuth';
import {
  fetchAdminMetrics,
  fetchAdminUsers,
  toggleBlockUser,
  updateRole,
  fetchAdminDonors,
  toggleDonorAvailability,
  fetchAdminRequests,
  updateRequestStatusAdmin,
  fetchAdminMatches,
  broadcastSystemAnnouncement,
  fetchAdminReports,
  resolveAdminReport,
  fetchAIMonitoringStats,
  fetchPlatformSettings,
  updatePlatformSettings,
} from '../../services/adminService';
import { BLOOD_GROUPS, MEDICAL_DISCLAIMER } from '../../utils/constants';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Active Tab: 10 Pillars
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // 1. Overview Metrics
  const [metrics, setMetrics] = useState(null);

  // 2. Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // 3. Donors
  const [donors, setDonors] = useState([]);
  const [donorBgFilter, setDonorBgFilter] = useState('ALL');
  const [donorCitySearch, setDonorCitySearch] = useState('');

  // 4. Requests
  const [requests, setRequests] = useState([]);
  const [requestBgFilter, setRequestBgFilter] = useState('ALL');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');

  // 5. Matches
  const [matches, setMatches] = useState([]);

  // 6. Announcement Broadcast Form
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetRole: 'ALL',
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // 7. Safety Reports
  const [reports, setReports] = useState([]);

  // 8. AI Stats
  const [aiStats, setAiStats] = useState(null);

  // 9 & 10. Platform Settings
  const [settingsForm, setSettingsForm] = useState({
    siteName: 'RakthaLink AI',
    tagline: 'Connecting Blood. Connecting Lives.',
    announcementBanner: '',
    isAnnouncementActive: true,
    maintenanceMode: false,
    emergencyContactPhone: '+91 104',
    supportedCities: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load All Tab Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setActionErrorMsg('');
    try {
      const [mRes, uRes, dRes, reqRes, matchRes, rRes, aiRes, setRes] = await Promise.all([
        fetchAdminMetrics(),
        fetchAdminUsers({ search: userSearch, role: userRoleFilter }),
        fetchAdminDonors({ bloodGroup: donorBgFilter, city: donorCitySearch }),
        fetchAdminRequests({ bloodGroup: requestBgFilter, status: requestStatusFilter }),
        fetchAdminMatches(),
        fetchAdminReports(),
        fetchAIMonitoringStats(),
        fetchPlatformSettings(),
      ]);

      if (mRes.success) setMetrics(mRes.data);
      if (uRes.success) setUsers(uRes.data || []);
      if (dRes.success) setDonors(dRes.data || []);
      if (reqRes.success) setRequests(reqRes.data || []);
      if (matchRes.success) setMatches(matchRes.data || []);
      if (rRes.success) setReports(rRes.data || []);
      if (aiRes.success) setAiStats(aiRes.data);
      if (setRes.success && setRes.data) {
        setSettingsForm({
          ...setRes.data,
          supportedCities: Array.isArray(setRes.data.supportedCities)
            ? setRes.data.supportedCities.join(', ')
            : setRes.data.supportedCities,
        });
      }
    } catch (err) {
      console.error('Admin data load error:', err);
      setActionErrorMsg('Could not load administrative data. Ensure you have Admin privileges.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [userSearch, userRoleFilter, donorBgFilter, donorCitySearch, requestBgFilter, requestStatusFilter]);

  // Actions
  const showToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleToggleBlockUser = async (id) => {
    try {
      const res = await toggleBlockUser(id);
      if (res.success) {
        showToast(res.message);
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user block state');
    }
  };

  const handleToggleRole = async (id, newRole) => {
    try {
      const res = await updateRole(id, newRole);
      if (res.success) {
        showToast(`Role updated to ${newRole}`);
        loadDashboardData();
      }
    } catch (err) {
      alert('Error updating role');
    }
  };

  const handleToggleDonorAvailability = async (id) => {
    try {
      const res = await toggleDonorAvailability(id);
      if (res.success) {
        showToast(res.message);
        loadDashboardData();
      }
    } catch (err) {
      alert('Error updating donor availability');
    }
  };

  const handleUpdateRequestStatus = async (id, status) => {
    try {
      const res = await updateRequestStatusAdmin(id, status);
      if (res.success) {
        showToast(`Request status updated to ${status}`);
        loadDashboardData();
      }
    } catch (err) {
      alert('Error updating request status');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    setIsBroadcasting(true);
    try {
      const res = await broadcastSystemAnnouncement(broadcastForm);
      if (res.success) {
        showToast(res.message);
        setBroadcastForm({ title: '', message: '', targetRole: 'ALL' });
      }
    } catch (err) {
      alert('Error broadcasting announcement');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleResolveReport = async (reportId, status, blockReportedUser = false) => {
    try {
      const res = await resolveAdminReport(reportId, {
        status,
        adminNotes: 'Resolved by Admin',
        blockReportedUser,
      });
      if (res.success) {
        showToast('Report updated successfully');
        loadDashboardData();
      }
    } catch (err) {
      alert('Error resolving report');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload = {
        ...settingsForm,
        supportedCities: settingsForm.supportedCities.split(',').map((c) => c.trim()),
      };
      const res = await updatePlatformSettings(payload);
      if (res.success) {
        showToast('Platform settings saved successfully');
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const kpis = metrics?.kpis || {};

  const tabs = [
    { key: 'OVERVIEW', label: '1. 📊 Dashboard', icon: Activity },
    { key: 'USERS', label: `2. 👥 Users (${users.length})`, icon: Users },
    { key: 'DONORS', label: `3. 🩸 Donors (${donors.length})`, icon: Heart },
    { key: 'REQUESTS', label: `4. 🏥 Requests (${requests.length})`, icon: Droplet },
    { key: 'MATCHES', label: `5. 🔗 Matches (${matches.length})`, icon: Layers },
    { key: 'ANNOUNCEMENTS', label: '6. 🔔 Broadcast', icon: Radio },
    { key: 'REPORTS', label: `7. 🚨 Reports (${reports.length})`, icon: ShieldAlert },
    { key: 'ANALYTICS', label: '8. 📈 Analytics', icon: TrendingUp },
    { key: 'AI_MONITOR', label: '9. 🤖 AI Monitor', icon: Bot },
    { key: 'SETTINGS', label: '10. ⚙️ Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
            <ShieldCheck className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                RakthaLink AI Administration Suite
              </h1>
              <Badge variant="purple" size="sm">
                👑 Admin: {user?.email || 'dharshang317@gmail.com'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive control center for managing users, voluntary donors, blood requests, matches, safety reports, notifications, AI activity, and platform settings.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={loadDashboardData}
        >
          Refresh All
        </Button>
      </div>

      {/* Action Alerts */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* 10 Pillars Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. 📊 TAB: DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <Card className="p-3.5 bg-slate-900 text-white space-y-1">
              <div className="text-[10px] font-semibold text-slate-400">Total Users</div>
              <div className="text-xl font-black font-['Outfit']">{kpis.totalUsers || 0}</div>
              <div className="text-[9px] text-slate-400">Registered accounts</div>
            </Card>

            <Card className="p-3.5 bg-emerald-50 border-emerald-200 text-emerald-900 space-y-1">
              <div className="text-[10px] font-semibold text-emerald-700">Potential Donors</div>
              <div className="text-xl font-black font-['Outfit'] text-emerald-800">{kpis.totalDonors || 0}</div>
              <div className="text-[9px] text-emerald-600">{kpis.activeDonors || 0} Active (🟢)</div>
            </Card>

            <Card className="p-3.5 bg-rose-50 border-rose-200 text-rose-900 space-y-1">
              <div className="text-[10px] font-semibold text-rose-700">Active Requests</div>
              <div className="text-xl font-black font-['Outfit'] text-rose-800">{kpis.activeRequests || 0}</div>
              <div className="text-[9px] text-rose-600">Pending fulfillment</div>
            </Card>

            <Card className="p-3.5 bg-purple-50 border-purple-200 text-purple-900 space-y-1">
              <div className="text-[10px] font-semibold text-purple-700">Active Matches</div>
              <div className="text-xl font-black font-['Outfit'] text-purple-800">{kpis.activeMatches || 0}</div>
              <div className="text-[9px] text-purple-600">In coordination</div>
            </Card>

            <Card className="p-3.5 bg-blue-50 border-blue-200 text-blue-900 space-y-1">
              <div className="text-[10px] font-semibold text-blue-700">Completed Connections</div>
              <div className="text-xl font-black font-['Outfit'] text-blue-800">{kpis.completedConnections || 0}</div>
              <div className="text-[9px] text-blue-600">Transfusions / visits</div>
            </Card>

            <Card className="p-3.5 bg-amber-50 border-amber-200 text-amber-900 space-y-1">
              <div className="text-[10px] font-semibold text-amber-700">Pending Requests</div>
              <div className="text-xl font-black font-['Outfit'] text-amber-800">{kpis.pendingRequests || 0}</div>
              <div className="text-[9px] text-amber-600">Open for matching</div>
            </Card>

            <Card className="p-3.5 bg-rose-100/60 border-rose-300 text-rose-950 space-y-1">
              <div className="text-[10px] font-semibold text-rose-800">Reported Users</div>
              <div className="text-xl font-black font-['Outfit'] text-rose-900">{kpis.reportedUsersCount || 0}</div>
              <div className="text-[9px] text-rose-700">{kpis.pendingReports || 0} Open reports</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Blood Group Request Distribution" subtitle="Active patient needs by blood group">
              <div className="space-y-3 pt-2">
                {metrics?.bloodGroupStats?.map((bg) => (
                  <div key={bg._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <BloodBadge bloodGroup={bg._id} size="sm" />
                        <span>{bg._id} Group</span>
                      </div>
                      <span className="font-['Outfit']">{bg.count} Requests</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (bg.count / (kpis.totalRequests || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Donors by Geographic Location" subtitle="Registered voluntary donor hubs">
              <div className="space-y-3 pt-2">
                {metrics?.donorsByCity?.map((d) => (
                  <div key={d._id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      <span>{d._id || 'Unspecified City'}</span>
                    </div>
                    <Badge variant="emerald" size="sm">
                      {d.count} Donors
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 👥 TAB: USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <Card title="Registered User Accounts & Access Control" subtitle="Search, filter, view roles, and manage suspicious accounts">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, or city..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="ALL">All Roles</option>
                <option value="donor">Donors</option>
                <option value="requester">Requesters</option>
                <option value="both">Both</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Joined</th>
                    <th className="py-2.5 px-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getUserAvatar(u)}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=dc2626&color=ffffff&bold=true&rounded=true`;
                            }}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleToggleRole(u._id, e.target.value)}
                          className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg font-bold"
                        >
                          <option value="donor">Donor</option>
                          <option value="requester">Requester</option>
                          <option value="both">Both</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-slate-600">{u.city || '--'}</td>

                      <td className="py-3 px-3">
                        {u.isBlocked ? (
                          <Badge variant="red" size="sm">Blocked</Badge>
                        ) : u.isDeactivated ? (
                          <Badge variant="neutral" size="sm">Deactivated</Badge>
                        ) : (
                          <Badge variant="emerald" size="sm">Active</Badge>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant={u.isBlocked ? 'success' : 'danger'}
                          icon={u.isBlocked ? Unlock : Lock}
                          onClick={() => handleToggleBlockUser(u._id)}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 3. 🩸 TAB: DONOR MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'DONORS' && (
        <Card title="Voluntary Donor Profiles & Availability Monitoring" subtitle="Filter donors, review reported accounts, and toggle availability">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={donorBgFilter}
                onChange={(e) => setDonorBgFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="ALL">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={donorCitySearch}
                  onChange={(e) => setDonorCitySearch(e.target.value)}
                  placeholder="Filter by City or Locality..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Donor Name</th>
                    <th className="py-2.5 px-3">Blood Group</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Availability</th>
                    <th className="py-2.5 px-3">Donations</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donors.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {d.userId?.name || 'Anonymous Donor'}
                        <div className="text-[10px] text-slate-400 font-normal">{d.userId?.email}</div>
                      </td>

                      <td className="py-3 px-3">
                        <BloodBadge bloodGroup={d.bloodGroup} size="sm" />
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {d.city} {d.area ? `(${d.area})` : ''}
                      </td>

                      <td className="py-3 px-3">
                        <Badge variant={d.isAvailable ? 'emerald' : 'neutral'} size="sm">
                          {d.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                        </Badge>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-700">{d.totalDonations || 0} times</td>

                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleDonorAvailability(d._id)}
                        >
                          Toggle Availability
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. 🏥 TAB: BLOOD REQUEST MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'REQUESTS' && (
        <Card title="Active Blood Requests Directory" subtitle="Monitor patient requirements, urgency priority, and lifecycle statuses">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={requestBgFilter}
                onChange={(e) => setRequestBgFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="ALL">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="MATCHED">MATCHED</option>
                <option value="IN_COORDINATION">IN_COORDINATION</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Patient & Hospital</th>
                    <th className="py-2.5 px-3">Blood Group</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Urgency</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{r.patientName}</div>
                        <div className="text-[11px] text-slate-500">{r.hospitalName} ({r.city})</div>
                      </td>

                      <td className="py-3 px-3">
                        <BloodBadge bloodGroup={r.bloodGroup} size="sm" />
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-700">{r.unitsRequired} Units</td>

                      <td className="py-3 px-3">
                        <UrgencyBadge urgency={r.urgency} size="sm" />
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={r.status} size="sm" />
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5">
                        {r.status !== 'RESOLVED' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUpdateRequestStatus(r._id, 'RESOLVED')}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        {r.status !== 'CANCELLED' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleUpdateRequestStatus(r._id, 'CANCELLED')}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 5. 🔗 TAB: MATCH MONITORING */}
      {/* ========================================================================= */}
      {activeTab === 'MATCHES' && (
        <Card title="Smart Match Monitoring & Coordination Status" subtitle="Logistical overview of candidate matches. (Medical compatibility is certified at hospital blood banks)">
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m._id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      Donor: {m.donorId?.name || 'Voluntary Donor'} ➔ Patient: {m.requestId?.patientName || 'Medical Case'}
                    </div>
                    <p className="text-slate-500">
                      Hospital: {m.requestId?.hospitalName} ({m.requestId?.city}) • Blood: <strong>{m.requestId?.bloodGroup}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ScoreGauge score={m.matchScore} size="sm" />
                  <Badge
                    variant={
                      m.status === 'ACCEPTED'
                        ? 'emerald'
                        : m.status === 'REQUESTED'
                        ? 'purple'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {m.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 6. 🔔 TAB: BROADCAST ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <Card title="System-Wide Announcements & Maintenance Broadcasts" subtitle="Send urgent platform notifications directly to all users or specific roles">
          <form onSubmit={handleBroadcast} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                placeholder="e.g. Scheduled System Maintenance Tonight / Urgent O- Blood Drive"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target User Audience
              </label>
              <select
                value={broadcastForm.targetRole}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="ALL">All Registered Users (Broadcast)</option>
                <option value="donor">Voluntary Donors Only</option>
                <option value="requester">Blood Requesters Only</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                placeholder="e.g. Please be advised that platform maintenance will occur from 11:00 PM to 11:30 PM. All emergency blood bank coordination remains active."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              loading={isBroadcasting}
            >
              Broadcast Notification to Platform
            </Button>
          </form>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 7. 🚨 TAB: REPORTS & COMPLAINTS */}
      {/* ========================================================================= */}
      {activeTab === 'REPORTS' && (
        <Card title="Safety Reports & Fraud Investigation Queue" subtitle="Investigate commercial selling, misleading info, and take moderation action">
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No reports filed yet.</p>
            ) : (
              reports.map((rep) => (
                <div key={rep._id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="red" size="sm">{rep.category.replace('_', ' ')}</Badge>
                      <Badge variant={rep.status === 'RESOLVED' ? 'emerald' : 'amber'} size="sm">{rep.status}</Badge>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-slate-800 italic font-medium">"{rep.description}"</p>

                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-4">
                    <span>Reporter: <strong>{rep.reporterId?.name || 'User'}</strong> ({rep.reporterId?.email})</span>
                    {rep.reportedUserId && (
                      <span>Reported: <strong>{rep.reportedUserId?.name}</strong> ({rep.reportedUserId?.email})</span>
                    )}
                  </div>

                  {rep.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleResolveReport(rep._id, 'RESOLVED', true)}
                      >
                        Block Reported User & Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveReport(rep._id, 'DISMISSED', false)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 8. 📈 TAB: ANALYTICS & REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Monthly Coordination Success Ratios">
              <div className="space-y-4 pt-2 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Match Conversion Rate:</span>
                  <span className="text-emerald-700 font-extrabold">{kpis.matchSuccessRate || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-3 rounded-full"
                    style={{ width: `${kpis.matchSuccessRate || 0}%` }}
                  />
                </div>

                <div className="flex justify-between font-bold text-slate-700 pt-2">
                  <span>Available vs Unavailable Donors:</span>
                  <span className="text-blue-700 font-extrabold">{kpis.activeDonors || 0} / {kpis.totalDonors || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${kpis.totalDonors > 0 ? (kpis.activeDonors / kpis.totalDonors) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card title="Blood Demand Overview">
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <strong>Total Platform Blood Needs Logged:</strong> {kpis.totalRequests || 0} Units Prescribed
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <strong>Total Units Coordinated & Fulfilled:</strong> {kpis.resolvedRequests || 0} Units
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. 🤖 TAB: AI USAGE MONITORING */}
      {/* ========================================================================= */}
      {activeTab === 'AI_MONITOR' && (
        <div className="space-y-6">
          <Card title="AI Gateway & Natural Language Engine Monitoring" subtitle="Status of server-side Google Gemini / offline knowledge gateway">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-purple-700 font-semibold block">Total AI Sessions:</span>
                <span className="text-xl font-black text-purple-900 font-['Outfit']">{aiStats?.totalConversations || 0}</span>
              </div>
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-blue-700 font-semibold block">Active Model Engine:</span>
                <span className="text-sm font-bold text-blue-900 font-mono">{aiStats?.activeModel || 'gemini-1.5-flash'}</span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 font-semibold block">Gateway Health:</span>
                <span className="text-sm font-bold text-emerald-900">🟢 Operational (Offline / Cloud Hybrid)</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Strict Medical Guardrail Reminder:</strong> The AI assistant performs data extraction and answers general public donation guidelines. The platform does NOT rely on AI for clinical medical decisions.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. ⚙️ TAB: PLATFORM SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'SETTINGS' && (
        <Card title="System Configuration & Platform Settings" subtitle="Configure platform identity, emergency contact helpline, and global announcements">
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Platform Name</label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Helpline Phone</label>
                <input
                  type="text"
                  value={settingsForm.emergencyContactPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, emergencyContactPhone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Global Announcement Banner</label>
              <input
                type="text"
                value={settingsForm.announcementBanner}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementBanner: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Supported Cities (Comma-separated)</label>
              <textarea
                rows={2}
                value={settingsForm.supportedCities}
                onChange={(e) => setSettingsForm({ ...settingsForm, supportedCities: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Settings}
              loading={isSavingSettings}
            >
              Save Platform Configuration
            </Button>
          </form>
        </Card>
      )}

    </div>
  );
}
