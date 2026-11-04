import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Radio,
  Send,
  Zap,
  Bell,
  Megaphone,
  Activity,
  Terminal,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SocketStudioModal = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const {
    connectionStatus,
    socketId,
    latency,
    eventLogs,
    clearEventLogs,
    sendPing,
    sendTestNotification,
    sendAdminBroadcast,
    sendSimulatedActivity
  } = useNotification();

  const [broadcastTitle, setBroadcastTitle] = useState('System Maintenance Notice');
  const [broadcastMsg, setBroadcastMsg] = useState('All systems operational. Real-time WebSockets verified.');
  const [testAlertMsg, setTestAlertMsg] = useState('Testing real-time notification dispatch!');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                WebSocket Live Studio & Event Inspector
              </h2>
              <p className="text-xs text-slate-300">
                Test and verify real-time Socket.io events with live visual triggers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                }`}
              ></span>
              <span
                className={
                  connectionStatus === 'connected' ? 'text-emerald-700 capitalize' : 'text-rose-600'
                }
              >
                {connectionStatus}
              </span>
            </div>

            <div className="text-slate-500 font-mono text-[11px]">
              Socket ID: <strong className="text-slate-800">{socketId || 'N/A'}</strong>
            </div>

            {latency !== null && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded-md">
                ⚡ {latency} ms latency
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              User: <strong className="text-slate-700">{user?.name || 'Guest'}</strong> ({user?.role || 'visitor'})
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Section 1: Interactive Trigger Panel */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              1. Interactive Event Triggers (Click to Fire)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Trigger 1: Latency Ping */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Radio className="w-3.5 h-3.5 text-indigo-600" />
                    Ping / Pong Test
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Emits <code className="text-indigo-600">client_ping</code> and measures server round-trip.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sendPing}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Measure Ping
                </button>
              </div>

              {/* Trigger 2: Test Notification */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                    Dispatch Alert Toast
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Fires a targeted notification via <code className="text-indigo-600">trigger_test_notification</code>.
                  </p>
                  <input
                    type="text"
                    value={testAlertMsg}
                    onChange={(e) => setTestAlertMsg(e.target.value)}
                    placeholder="Custom message..."
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg mb-3 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => sendTestNotification(testAlertMsg)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Notification
                </button>
              </div>

              {/* Trigger 3: Admin Activity Event */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    Simulate Audit Stream
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Emits <code className="text-indigo-600">activity_log</code> packet directly to admin room.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => sendSimulatedActivity('DEMO_INSPECTOR_VERIFY')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  Simulate Activity
                </button>
              </div>
            </div>

            {/* Admin Global Broadcast Trigger */}
            {isAdmin && (
              <div className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Admin Exclusive: Global System Announcement Broadcast
                  </h4>
                </div>
                <p className="text-[11px] text-amber-700 mb-3">
                  Broadcasts a real-time banner across every open browser window on the website simultaneously.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Announcement Title"
                    className="px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Announcement Message"
                    className="px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-xl outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => sendAdminBroadcast(broadcastTitle, broadcastMsg)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Broadcast Live to All Users Now
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Live WebSocket Event Terminal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600" />
                2. Live WebSocket Event Stream ({eventLogs.length} Packets)
              </h3>
              {eventLogs.length > 0 && (
                <button
                  onClick={clearEventLogs}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Stream
                </button>
              )}
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto border border-slate-800 space-y-2">
              {eventLogs.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  No socket events captured yet. Click a trigger above to fire an event!
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            log.direction === 'SENT'
                              ? 'bg-indigo-900 text-indigo-300'
                              : 'bg-emerald-900 text-emerald-300'
                          }`}
                        >
                          {log.direction}
                        </span>
                        <span className="text-white font-bold text-xs">{log.eventName}</span>
                      </div>
                      <span className="text-slate-500">{log.time}</span>
                    </div>

                    <pre className="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap bg-black/40 p-1.5 rounded">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>DevSphere Real-Time WebSocket Testing Center</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
