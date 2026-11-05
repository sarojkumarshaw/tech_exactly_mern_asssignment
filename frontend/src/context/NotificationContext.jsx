import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [socketId, setSocketId] = useState('');
  const [latency, setLatency] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [announcement, setAnnouncement] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('app_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  const [toasts, setToasts] = useState([]);
  const [desktopPermission, setDesktopPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  // Toast dispatch
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Gentle audio chime for push alerts (zero external audio files, native Web Audio API)
  const playNotificationSound = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5 note
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {
        // Audio optional / browser gesture blocked
      }
    }
  }, []);

  // Browser HTML5 Desktop Notification trigger
  const triggerBrowserPush = useCallback((title, body, targetUrl = '/notifications') => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico'
          });
          notification.onclick = () => {
            window.focus();
            if (targetUrl && typeof window !== 'undefined') {
              window.location.href = targetUrl;
            }
          };
        } catch {
          // Fallback if browser blocks constructor
        }
      }
    }
  }, []);

  // Request browser desktop push permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setDesktopPermission(perm);
        if (perm === 'granted') {
          showToast('Desktop push notifications enabled!', 'success');
        } else if (perm === 'denied') {
          showToast('Desktop push notifications blocked in browser settings', 'warning');
        }
        return perm;
      } catch {
        return 'denied';
      }
    }
    return 'unsupported';
  }, [showToast]);

  // Helper to log socket events to the UI inspector
  const logEvent = useCallback((direction, eventName, data) => {
    setEventLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        direction, // 'SENT' | 'RECEIVED'
        eventName,
        data
      },
      ...prev.slice(0, 49) // Keep last 50 events
    ]);
  }, []);

  const userId = user?._id || user?.id;

  // Sync with MongoDB backend for authenticated users
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=30');
        if (isMounted && res.data?.data) {
          setNotifications(res.data.data);
        }
      } catch {
        // Fallback to local state if offline or during setup
      }
    };

    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      if (userId) {
        await api.patch('/notifications/read-all');
      }
    } catch {
      // ignore
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    try {
      localStorage.removeItem('app_notifications');
      if (userId) {
        await api.delete('/notifications');
      }
    } catch {
      // ignore
    }
  };

  const clearEventLogs = () => {
    setEventLogs([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const newSocket = io(window.location.origin, {
      auth: { token },
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      setSocketId(newSocket.id);
      logEvent('RECEIVED', 'connect', { socketId: newSocket.id });
    });

    newSocket.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      logEvent('RECEIVED', 'disconnect', { reason });
    });

    // Latency pong listener
    newSocket.on('server_pong', (data) => {
      const rtt = Date.now() - data.clientTime;
      setLatency(rtt);
      logEvent('RECEIVED', 'server_pong', { ...data, roundTripMs: rtt });
      showToast(`⚡ WebSocket Ping: ${rtt}ms latency`, 'success', 2500);
    });

    // Targeted notification event (e.g. comment on user's post, admin moderation)
    newSocket.on('notification', (data) => {
      logEvent('RECEIVED', 'notification', data);
      const itemId = data._id || data.id || Date.now();
      setNotifications((prev) => {
        if (prev.some((n) => (n._id && n._id === itemId) || (n.id && n.id === itemId))) {
          return prev;
        }
        return [{ ...data, id: itemId, read: false }, ...prev];
      });
      showToast(data.message, 'info');
      playNotificationSound();
      const targetUrl = data.slug ? `/posts/${data.slug}` : (data.link || '/notifications');
      triggerBrowserPush(data.title || 'Tech Exactly - New Notification', data.message, targetUrl);
    });

    // Public post broadcast
    newSocket.on('new_post', (post) => {
      logEvent('RECEIVED', 'new_post', post);
      const itemId = post._id || Date.now();
      const notifItem = {
        _id: 'post_' + itemId,
        id: itemId,
        type: 'POST_PUBLISHED',
        title: 'New Article Published',
        message: `New article published: "${post.title}"`,
        slug: post.slug,
        link: `/posts/${post.slug}`,
        createdAt: post.createdAt || new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => {
        if (prev.some((n) => n.slug === post.slug || (n._id && n._id === notifItem._id))) {
          return prev;
        }
        return [notifItem, ...prev];
      });
      showToast(`New article published: "${post.title}"`, 'success');
      playNotificationSound();
      triggerBrowserPush('Tech Exactly - New Article Published', post.title, `/posts/${post.slug}`);
    });

    // Global admin announcement broadcast
    newSocket.on('broadcast_announcement', (announcementData) => {
      logEvent('RECEIVED', 'broadcast_announcement', announcementData);
      setAnnouncement(announcementData);
      const itemId = announcementData._id || announcementData.id || 'ann_' + Date.now();
      const notifItem = {
        _id: itemId,
        id: itemId,
        type: 'ADMIN_BROADCAST',
        title: announcementData.title || 'System Announcement',
        message: announcementData.message,
        createdAt: announcementData.createdAt || new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => {
        if (prev.some((n) => (n._id && n._id === itemId) || (n.id && n.id === itemId))) {
          return prev;
        }
        return [notifItem, ...prev];
      });
      showToast(`📢 Announcement: ${announcementData.title}`, 'warning', 6000);
      playNotificationSound();
      triggerBrowserPush(`📢 ${announcementData.title}`, announcementData.message, '/notifications');
    });

    // Real-time post deletion/restoration updates
    newSocket.on('post_deleted', (data) => {
      logEvent('RECEIVED', 'post_deleted', data);
      const notifItem = {
        _id: 'del_' + Date.now(),
        id: Date.now(),
        type: 'POST_DELETED',
        title: 'Article Removed by Admin',
        message: `Post "${data.title}" was soft-deleted by moderator.`,
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [notifItem, ...prev]);
      showToast(`⚠️ Post "${data.title}" was soft-deleted`, 'warning');
      playNotificationSound();
    });

    newSocket.on('post_restored', (data) => {
      logEvent('RECEIVED', 'post_restored', data);
      const notifItem = {
        _id: 'res_' + Date.now(),
        id: Date.now(),
        type: 'POST_RESTORED',
        title: 'Article Restored',
        message: `Post "${data.title}" has been restored.`,
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [notifItem, ...prev]);
      showToast(`✅ Post "${data.title}" has been restored`, 'success');
      playNotificationSound();
    });

    // Activity log event for admin room
    newSocket.on('activity_log', (activityData) => {
      logEvent('RECEIVED', 'activity_log', activityData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, logEvent, showToast, triggerBrowserPush, playNotificationSound]);

  // Interactive Trigger Methods
  const sendPing = () => {
    if (!socket || !socket.connected) {
      showToast('Socket not connected', 'error');
      return;
    }
    const payload = { clientTime: Date.now() };
    socket.emit('client_ping', payload);
    logEvent('SENT', 'client_ping', payload);
  };

  const sendTestNotification = (customMsg, type = 'TEST_ALERT', title = 'Live Notification', options = {}) => {
    if (!socket || !socket.connected) {
      showToast('Socket not connected', 'error');
      return;
    }
    const isBroadcast = options.broadcast ?? (user?.role === 'admin');
    const payload = {
      message: customMsg || '🧪 Testing live Socket.io notification!',
      type,
      title,
      broadcast: isBroadcast,
      target: options.target || (isBroadcast ? 'all' : 'self')
    };
    socket.emit('trigger_test_notification', payload);
    logEvent('SENT', 'trigger_test_notification', payload);
  };

  const sendAdminBroadcast = async (title, message) => {
    const payload = {
      title: title || 'Live System Announcement',
      message: message || 'Broadcasting real-time alert to all connected users!'
    };
    try {
      await api.post('/admin/broadcast', payload);
      logEvent('SENT', 'admin_broadcast_api', payload);
    } catch {
      if (socket && socket.connected) {
        socket.emit('trigger_admin_broadcast', payload);
        logEvent('SENT', 'trigger_admin_broadcast', payload);
      }
    }
  };

  const sendSimulatedActivity = (action) => {
    if (!socket || !socket.connected) return;
    const payload = { action: action || 'MANUAL_TEST_EVENT' };
    socket.emit('trigger_simulated_activity', payload);
    logEvent('SENT', 'trigger_simulated_activity', payload);
  };

  const value = {
    socket,
    connectionStatus,
    socketId,
    latency,
    eventLogs,
    announcement,
    clearAnnouncement: () => setAnnouncement(null),
    clearEventLogs,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    desktopPermission,
    requestNotificationPermission,
    toasts,
    showToast,
    removeToast,
    markAllAsRead,
    clearNotifications,
    sendPing,
    sendTestNotification,
    sendAdminBroadcast,
    sendSimulatedActivity
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Global Real-Time Announcement Banner */}
      {announcement && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-3 shadow-lg fixed top-16 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] uppercase font-bold tracking-wider">
                Live Broadcast
              </span>
              <span><strong>{announcement.title}:</strong> {announcement.message}</span>
              <span className="text-white/70 text-xs hidden sm:inline">• from {announcement.sender}</span>
            </div>
            <button
              onClick={() => setAnnouncement(null)}
              className="text-white hover:text-white/80 text-sm font-bold px-2 py-1 rounded-lg hover:bg-white/10"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : toast.type === 'error'
                ? 'bg-rose-600 text-white shadow-rose-600/20'
                : toast.type === 'warning'
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-slate-900 text-white shadow-slate-900/20'
              }`}
          >
            <div className="flex items-center gap-2">
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-white/70 hover:text-white text-lg font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
