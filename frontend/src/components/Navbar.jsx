import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  PlusCircle,
  Shield,
  FileText,
  LogOut,
  Bell,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { TechExactlyLogo } from './TechExactlyLogo';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearNotifications, connectionStatus } = useNotification();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Tech Exactly */}
          <Link to="/" className="flex items-center group">
            <TechExactlyLogo size="md" showTag={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Explore Articles
            </Link>

            <Link
              to="/notifications"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors relative"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/create-post"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  Write Post
                </Link>

                <Link
                  to="/my-posts"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  My Posts
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Action Icons / Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Real-time Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) markAllAsRead();
                    }}
                    className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Real-time notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Notifications
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                          >
                            Full View →
                          </Link>
                          {notifications.length > 0 && (
                            <button
                              onClick={clearNotifications}
                              className="text-[11px] text-slate-400 hover:text-rose-500"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center px-4">
                            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <div className="text-xs font-semibold text-slate-500">No new notifications</div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Real-time post updates and admin broadcasts will appear here.
                            </p>
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((item, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                setShowNotifications(false);
                                if (item.link) navigate(item.link);
                                else if (item.slug) navigate(`/posts/${item.slug}`);
                                else navigate('/notifications');
                              }}
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-xs text-slate-700 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="font-bold text-slate-900 truncate">
                                  {item.title || 'Live Notification'}
                                </span>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'Just now'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {item.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="px-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Powered by Socket.io</span>
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Open Notification Center
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Badge */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {user?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2"
          >
            Explore Articles
          </Link>
          <Link
            to="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-medium text-slate-700 py-2"
          >
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/create-post"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-indigo-600 py-2"
              >
                + Write New Post
              </Link>
              <Link
                to="/my-posts"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-2"
              >
                My Posts
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-amber-700 py-2"
                >
                  Admin Panel
                </Link>
              )}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{user?.name} ({user?.role})</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

