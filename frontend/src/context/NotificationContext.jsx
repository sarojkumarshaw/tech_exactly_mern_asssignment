import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const newSocket = io(window.location.origin, {
      auth: { token },
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    // Targeted notification event (e.g. comment on user's post)
    newSocket.on('notification', (data) => {
      setNotifications((prev) => [{ ...data, id: Date.now(), read: false }, ...prev]);
      showToast(data.message, 'info');
    });

    // Public post broadcast
    newSocket.on('new_post', (post) => {
      showToast(`New article published: "${post.title}"`, 'success');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, showToast]);

  const value = {
    socket,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    toasts,
    showToast,
    removeToast,
    markAllAsRead,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === 'success'
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
