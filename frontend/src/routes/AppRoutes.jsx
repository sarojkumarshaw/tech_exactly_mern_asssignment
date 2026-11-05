import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { PostDetails } from '../pages/PostDetails';
import { CreatePost } from '../pages/CreatePost';
import { EditPost } from '../pages/EditPost';
import { MyPosts } from '../pages/MyPosts';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { AdminDashboard } from '../pages/AdminDashboard';
import { NotFound } from '../pages/NotFound';
import OAuthCallback from '../pages/OAuthCallback';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/AdminRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/posts/:slug" element={<PostDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />

      {/* Authenticated User Pages */}
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-post/:id"
        element={
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-posts"
        element={
          <ProtectedRoute>
            <MyPosts />
          </ProtectedRoute>
        }
      />

      {/* Admin Panel Pages */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

