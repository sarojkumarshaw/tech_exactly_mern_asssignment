import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { Navbar } from '../components/Navbar';
import * as AuthContextModule from '../context/AuthContext';
import * as NotificationContextModule from '../context/NotificationContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: vi.fn()
}));

describe('Navbar Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(NotificationContextModule.useNotification).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAllAsRead: vi.fn(),
      clearNotifications: vi.fn(),
      connectionStatus: 'connected'
    });
  });

  it('renders public guest navigation when unauthenticated', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      logout: mockLogout
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Tech Exactly Logo
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Exactly')).toBeInTheDocument();

    // Guest Auth Links
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();

    // Authenticated links should not be present
    expect(screen.queryByText('Write Post')).not.toBeInTheDocument();
    expect(screen.queryByText('My Posts')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('renders authenticated author navigation links', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice Author', email: 'alice@example.com', role: 'user' },
      isAuthenticated: true,
      isAdmin: false,
      logout: mockLogout
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Write Post')).toBeInTheDocument();
    expect(screen.getByText('My Posts')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('renders admin badge and admin panel link for admin user', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      isAuthenticated: true,
      isAdmin: true,
      logout: mockLogout
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('displays notification unread badge when unreadCount > 0', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { name: 'Alice Author', email: 'alice@example.com', role: 'user' },
      isAuthenticated: true,
      isAdmin: false,
      logout: mockLogout
    });

    vi.mocked(NotificationContextModule.useNotification).mockReturnValue({
      notifications: [{ _id: 'notif-1', message: 'New comment' }],
      unreadCount: 3,
      markAllAsRead: vi.fn(),
      clearNotifications: vi.fn(),
      connectionStatus: 'connected'
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });
});
