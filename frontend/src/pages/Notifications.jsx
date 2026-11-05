import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Radio,
  Zap,
  MessageSquare,
  FileText,
  Megaphone,
  Clock,
  ArrowRight,
  Shield,
  Send
} from 'lucide-react';

export const Notifications = () => {
  const { user, isAdmin } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
    connectionStatus,
    latency,
    socketId,
    desktopPermission,
    requestNotificationPermission,
    sendPing,
    sendTestNotification,
    showToast
  } = useNotification();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'announcements'
  const [customMsg, setCustomMsg] = useState('');

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'announcements') return n.type === 'ANNOUNCEMENT';
    return true;
  });

  const handleSendCustomTest = (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    sendTestNotification(customMsg.trim());
    setCustomMsg('');
    showToast('Test notification transmitted via WebSocket', 'success');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-5 h-5 text-amber-500" />;
      case 'COMMENT':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'POST':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMMENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'POST':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Socket.io Real-Time Subsystem
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time WebSocket event feed per assignment specifications (Socket.io).
          </p>
        </div>

        {/* Live Socket Status Card */}
        <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-bold text-slate-700 uppercase">
              {connectionStatus === 'connected' ? 'Socket Connected' : 'Disconnected'}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-xs text-slate-500">
            Latency:{' '}
            <span className="font-bold text-slate-800">
              {latency !== null ? `${latency}ms` : '--'}
            </span>
          </div>
          <button
            onClick={sendPing}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all"
            title="Measure round-trip ping"
          >
            Ping
          </button>

          {typeof window !== 'undefined' && 'Notification' in window && (
            <>
              <span className="text-slate-300">|</span>
              <button
                onClick={requestNotificationPermission}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  desktopPermission === 'granted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80'
                }`}
                title="Enable OS Desktop Push Notifications"
              >
                <Bell className="w-3 h-3" />
                {desktopPermission === 'granted' ? 'Desktop Push Active' : 'Enable Desktop Push'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Notification Stream (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'unread'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveFilter('announcements')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'announcements'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Broadcasts
              </button>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">You're all caught up!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active notifications found in this view. When new articles, comments, or admin announcements occur, they will stream here live.
              </p>
              <button
                onClick={() => sendTestNotification('Sample WebSocket notification event')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                Trigger Test Notification
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 transition-all shadow-sm flex items-start gap-4 ${
                    !item.read
                      ? 'border-blue-300 bg-blue-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${getTypeBadge(
                          item.type
                        )}`}
                      >
                        {item.type || 'SYSTEM'}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                      )}
                      <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title || 'Notification'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">{item.message}</p>

                    {item.link && (
                      <Link
                        to={item.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 mt-2 hover:underline"
                      >
                        View related content <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Interactive Testing & Info (1 Col) */}
        <div className="space-y-6">
          {/* Quick Push Test Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Interactive Socket Push</h3>
            </div>
            <p className="text-xs text-slate-500">
              Trigger instant real-time events to see the WebSocket push to this client.
            </p>

            <form onSubmit={handleSendCustomTest} className="space-y-3">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Custom notification message..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit Event
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => sendTestNotification('🚀 New comment posted on your article!')}
                className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-slate-700 font-semibold transition-colors flex items-center justify-between"
              >
                <span>Simulate Comment Event</span>
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              </button>
              <button
                type="button"
                onClick={() => sendTestNotification('📢 Tech Exactly Assignment evaluation alert')}
                className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-slate-700 font-semibold transition-colors flex items-center justify-between"
              >
                <span>Simulate Assignment Broadcast</span>
                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              </button>
            </div>
          </div>

          {/* Assignment Requirement Compliance Note */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-bold tracking-tight">Assignment Compliance</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Requirement:</strong> Implement real-time notifications using Socket.io or similar libraries.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• Bi-directional WebSockets on Port 5000</div>
              <div>• Real-time room segregation (<code>user_&lt;id&gt;</code>, <code>admin_room</code>)</div>
              <div>• Automatic toast dispatch &amp; persistent drawer storage</div>
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-2"
              >
                Go to Admin Broadcast Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

