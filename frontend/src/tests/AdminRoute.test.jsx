import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { AdminRoute } from '../components/AdminRoute';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('AdminRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner while authentication status is loading', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminRoute>
          <div>Admin Secret Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Secret Content')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Content</div>
              </AdminRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Secret Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page Target')).toBeInTheDocument();
  });

  it('redirects regular authenticated user (non-admin) to root "/"', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
      user: { name: 'Standard User', role: 'user' }
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Content</div>
              </AdminRoute>
            }
          />
          <Route path="/" element={<div>Home Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Secret Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page Target')).toBeInTheDocument();
  });

  it('renders children when authenticated user has admin privileges', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
      user: { name: 'Admin Master', role: 'admin' }
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminRoute>
          <div>Admin Management Dashboard</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Management Dashboard')).toBeInTheDocument();
  });
});
