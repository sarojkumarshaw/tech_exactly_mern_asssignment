import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Pagination } from '../components/Pagination';
import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  Activity,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
  Zap,
  Megaphone,
  Bell,
  Send
} from 'lucide-react';
import { SocketStudioModal } from '../components/SocketStudioModal';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    socket,
    showToast,
    sendPing,
    sendTestNotification,
    sendAdminBroadcast,
    sendSimulatedActivity,
    latency,
    connectionStatus
  } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'posts' | 'broadcast' | 'logs'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Quick broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('Tech Exactly Assignment Notice');
  const [broadcastCategory, setBroadcastCategory] = useState('ANNOUNCEMENT');
  const [broadcastHistory, setBroadcastHistory] = useState([
    {
      id: 1,
      title: 'Welcome Evaluator to Tech Exactly MERN Demo',
      message: 'Socket.io real-time subsystem connected with low-latency ping.',
      category: 'ANNOUNCEMENT',
      sentAt: '12:00:00 PM',
      status: 'Broadcasted'
    }
  ]);

  const handleSendBroadcast = (e) => {
    if (e) e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('Title and message are required', 'error');
      return;
    }
    sendAdminBroadcast(broadcastTitle.trim(), broadcastMessage.trim());
    setBroadcastHistory((prev) => [
      {
        id: Date.now(),
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        category: broadcastCategory,
        sentAt: new Date().toLocaleTimeString(),
        status: 'Broadcasted'
      },
      ...prev
    ]);
    showToast(`📢 Global broadcast emitted: "${broadcastTitle}"`, 'success');
  };
  const [broadcastMessage, setBroadcastMessage] = useState('Tech Exactly MERN services running with WebSocket sync enabled.');

  // Tab: Users
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');

  // Tab: Posts
  const [posts, setPosts] = useState([]);
  const [postPagination, setPostPagination] = useState(null);
  const [postPage, setPostPage] = useState(1);
  const [postStatusFilter, setPostStatusFilter] = useState('all'); // 'all' | 'active' | 'deleted'

  // Tab: Activity Logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [logPagination, setLogPagination] = useState(null);
  const [logPage, setLogPage] = useState(1);

  // Fetch Dashboard Stats & Overview
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data.stats);
      setActivityLogs(res.data.data.recentActivities || []);
    } catch (err) {
      showToast('Failed to fetch admin stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Listen to live activity log stream via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleLiveActivity = (log) => {
      setActivityLogs((prev) => [log, ...prev]);
      // Update quick counter if post or user action
      fetchStats();
    };

    socket.on('activity_log', handleLiveActivity);
    return () => {
      socket.off('activity_log', handleLiveActivity);
    };
  }, [socket]);

  // Fetch Users when 'users' tab is active
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { page: userPage, limit: 8, search: userSearch.trim() || undefined }
      });
      setUsers(res.data.data);
      setUserPagination(res.data.meta);
    } catch (err) {
      showToast('Failed to load users', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userPage, userSearch]);

  // Fetch Posts when 'posts' tab is active
  const fetchPosts = async () => {
    try {
      const params = { page: postPage, limit: 8 };
      if (postStatusFilter !== 'all') params.status = postStatusFilter;

      const res = await api.get('/admin/posts', { params });
      setPosts(res.data.data);
      setPostPagination(res.data.meta);
    } catch (err) {
      showToast('Failed to load posts', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [activeTab, postPage, postStatusFilter]);

  // Fetch Logs when 'logs' tab is active
  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/logs/activity', {
        params: { page: logPage, limit: 12 }
      });
      setActivityLogs(res.data.data);
      setLogPagination(res.data.meta);
    } catch (err) {
      showToast('Failed to load activity logs', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, logPage]);

  // User Actions
  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${targetUser.name}'s role to ${newRole}?`)) return;

    try {
      await api.patch(`/admin/users/${targetUser._id}/role`, { role: newRole });
      showToast(`User role updated to ${newRole}`, 'success');
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to change role', 'error');
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = !targetUser.isActive;
    const actionName = nextStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionName} this user account?`)) return;

    try {
      await api.patch(`/admin/users/${targetUser._id}/status`, { isActive: nextStatus });
      showToast(`User ${actionName}d`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their articles permanently?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('User removed', 'success');
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete user', 'error');
    }
  };

  // Post Actions
  const handleSoftDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      showToast('Post soft deleted', 'warning');
      fetchPosts();
      fetchStats();
    } catch (err) {
      showToast('Failed to soft delete post', 'error');
    }
  };

  const handleRestorePost = async (postId) => {
    try {
      await api.patch(`/posts/${postId}/restore`);
      showToast('Post restored successfully', 'success');
      fetchPosts();
      fetchStats();
    } catch (err) {
      showToast('Failed to restore post', 'error');
    }
  };

  const handlePermanentDeletePost = async (postId) => {
    if (!window.confirm('PERMANENT ACTION: Are you sure you want to hard delete this post and all its comments? This cannot be undone.')) return;

    try {
      await api.delete(`/posts/${postId}/permanent`);
      showToast('Post permanently deleted from database', 'info');
      fetchPosts();
      fetchStats();
    } catch (err) {
      showToast('Failed to permanently delete post', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            Tech Exactly • Superadmin Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global metrics, role-based access control, content moderation, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStudioOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Socket Studio
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Live WebSocket Sync
          </span>
          <button
            onClick={() => {
              fetchStats();
              if (activeTab === 'users') fetchUsers();
              if (activeTab === 'posts') fetchPosts();
              if (activeTab === 'logs') fetchLogs();
            }}
            className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-colors"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {/* Total Users */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Users
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats?.totalUsers ?? '...'}
            </div>
            <span className="text-[11px] font-medium text-emerald-600 mt-1 block">
              Active accounts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Posts */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Posts
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats?.totalPosts ?? '...'}
            </div>
            <span className="text-[11px] font-medium text-slate-500 mt-1 block">
              {stats?.activePosts ?? 0} active • {stats?.softDeletedPosts ?? 0} soft-deleted
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Comments */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Comments
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {stats?.totalComments ?? '...'}
            </div>
            <span className="text-[11px] font-medium text-slate-500 mt-1 block">
              Across all publications
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Soft Deleted Posts */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Soft Deleted
            </span>
            <div className="text-3xl font-black text-amber-600 mt-1">
              {stats?.softDeletedPosts ?? '...'}
            </div>
            <span className="text-[11px] font-medium text-amber-700 mt-1 block">
              Can be restored anytime
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Feed', icon: Activity },
          { id: 'users', label: 'Users Management', icon: Users },
          { id: 'posts', label: 'Posts Moderation', icon: FileText },
          { id: 'broadcast', label: 'Send Notifications & Broadcast', icon: Bell },
          { id: 'logs', label: 'Audit Activity Logs', icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${isActive
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Live WebSocket Quick Trigger Console */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  Live Socket.io Control Room
                </div>
                <h3 className="text-xl font-black tracking-tight">
                  Instant Real-Time Event Triggers
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Click below to broadcast messages, trigger targeted toasts, or ping the server across all live clients.
                </p>
              </div>

              <button
                onClick={() => setIsStudioOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 shadow-md transition-all self-start sm:self-auto"
              >
                <Zap className="w-4 h-4 text-indigo-600" />
                Open Live Event Inspector
              </button>
            </div>

            {/* Global Broadcast Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Megaphone className="w-4 h-4" />
                Global Live Announcement Broadcast (Pushes to all active browser windows)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Announcement Title..."
                  className="px-3.5 py-2 text-xs bg-slate-900/60 border border-white/20 rounded-xl text-white outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Announcement Message..."
                  className="px-3.5 py-2 text-xs bg-slate-900/60 border border-white/20 rounded-xl text-white outline-none focus:border-indigo-400"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sendAdminBroadcast(broadcastTitle, broadcastMessage);
                    showToast('Global announcement emitted!', 'success');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Emit Broadcast to All Users
                </button>

                <button
                  type="button"
                  onClick={sendPing}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Measure Ping Latency
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sendSimulatedActivity('ADMIN_MANUAL_SOCKET_TEST');
                    showToast('Simulated audit packet sent to stream', 'info');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Simulate Activity Packet
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Live User Activity Stream
              </h3>
              <span className="text-xs text-slate-400">Latest 10 activities</span>
            </div>

            <div className="divide-y divide-slate-100">
              {activityLogs.slice(0, 8).map((log, idx) => (
                <div key={log._id || idx} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[11px] font-bold rounded-lg">
                      {log.action}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{log.userEmail || 'System'}</span>
                      <span className="text-slate-400 ml-2">({log.entityType})</span>
                    </div>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <span className="text-xs text-slate-400">
              Total registered: <strong>{userPagination?.totalDocs || 0}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-wider text-[10px] font-bold text-slate-500">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${u.isActive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                      >
                        {u.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u._id !== user._id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
                            title="Toggle Admin/User"
                          >
                            {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${u.isActive
                              ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              pagination={userPagination}
              onPageChange={(p) => setUserPage(p)}
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT: Posts Moderation */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                Status Filter:
              </span>
              {['all', 'active', 'deleted'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setPostStatusFilter(status);
                    setPostPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${postStatusFilter === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">
              Total matched: <strong>{postPagination?.totalDocs || 0}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-wider text-[10px] font-bold text-slate-500">
                  <th className="py-4 px-6">Post Title</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 max-w-xs sm:max-w-md">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.title}</div>
                      <div className="text-[11px] font-mono text-slate-400">/{p.slug}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {p.author?.name || 'Unknown Author'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                        {p.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {p.isDeleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Soft Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/posts/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        {p.isDeleted ? (
                          <button
                            onClick={() => handleRestorePost(p._id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                            title="Restore Soft-deleted Post"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSoftDeletePost(p._id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                            title="Soft Delete"
                          >
                            Soft Delete
                          </button>
                        )}

                        <button
                          onClick={() => handlePermanentDeletePost(p._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Permanent Hard Delete"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              pagination={postPagination}
              onPageChange={(p) => setPostPage(p)}
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT: Real-Time Broadcast & Notification Center */}
      {activeTab === 'broadcast' && (
        <div className="space-y-8">
          {/* Main Broadcast Console Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  Socket.io Global Transmitter
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Send Real-Time Notification to Online Users
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pushes instantaneous WebSocket toast notifications and updates user notification bells in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Transmitter Online
                </span>
              </div>
            </div>

            {/* Composer Form */}
            <form onSubmit={handleSendBroadcast} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Notification / Announcement Title
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Scheduled System Update at 10:00 PM"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Event Category
                  </label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                  >
                    <option value="ANNOUNCEMENT">📢 Announcement (Info)</option>
                    <option value="WARNING">⚠️ Urgent Alert (Warning)</option>
                    <option value="SUCCESS">🎉 Platform Milestone (Success)</option>
                    <option value="MAINTENANCE">🔧 Scheduled Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notification Message Body
                </label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter the detailed announcement message to be broadcast to all connected clients..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Template Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Presets:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastTitle('Tech Exactly Assignment Review');
                    setBroadcastMessage('Evaluator active: Testing real-time WebSocket notifications & RBAC controls.');
                    setBroadcastCategory('ANNOUNCEMENT');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Tech Exactly Evaluation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastTitle('Platform Performance Update');
                    setBroadcastMessage('MongoDB queries indexed and cached. Latency reduced under 50ms.');
                    setBroadcastCategory('SUCCESS');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Performance Milestone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastTitle('Scheduled Maintenance Notice');
                    setBroadcastMessage('Database backup routine scheduled at 02:00 UTC. Zero downtime expected.');
                    setBroadcastCategory('MAINTENANCE');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Scheduled Maintenance
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  Transmit Live Broadcast via Socket.io
                </button>
                <button
                  type="button"
                  onClick={sendPing}
                  className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  Ping Socket Server ({latency ?? '--'}ms)
                </button>
              </div>
            </form>
          </div>

          {/* Broadcast History Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Broadcast Dispatch Log</h4>
                <p className="text-xs text-slate-400">Events emitted during current server session</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Total Broadcasts: {broadcastHistory.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-[10px] font-bold text-slate-500">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Announcement Title</th>
                    <th className="py-3.5 px-6">Message Body</th>
                    <th className="py-3.5 px-6">Delivery Scope</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {broadcastHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">{item.sentAt}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">{item.title}</td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate">{item.message}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-500">Global (All Users)</td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Activity Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Full System Audit Trail (MongoDB ActivityLog & Winston)
            </h3>
            <span className="text-xs text-slate-400">
              Total logged events: <strong>{logPagination?.totalDocs || activityLogs.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-wider text-[10px] font-bold text-slate-500">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Entity</th>
                  <th className="py-4 px-6">User Email</th>
                  <th className="py-4 px-6">IP Address</th>
                  <th className="py-4 px-6">Endpoint</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {activityLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-6 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-6">
                      <span className="font-bold text-indigo-600">{log.action}</span>
                    </td>
                    <td className="py-3 px-6 text-slate-700">{log.entityType}</td>
                    <td className="py-3 px-6 text-slate-900 font-sans">{log.userEmail || 'anonymous'}</td>
                    <td className="py-3 px-6 text-slate-500">{log.ip}</td>
                    <td className="py-3 px-6 text-slate-600 font-sans">{log.endpoint}</td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {log.statusCode || 200}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              pagination={logPagination}
              onPageChange={(p) => setLogPage(p)}
            />
          </div>
        </div>
      )}

      {/* Socket Live Testing Inspector Modal */}
      <SocketStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </div>
  );
};

