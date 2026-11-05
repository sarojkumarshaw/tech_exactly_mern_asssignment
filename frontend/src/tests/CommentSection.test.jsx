import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { CommentSection } from '../components/CommentSection';
import * as AuthContextModule from '../context/AuthContext';
import * as NotificationContextModule from '../context/NotificationContext';
import api from '../services/api';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: vi.fn()
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('CommentSection Component', () => {
  const mockShowToast = vi.fn();
  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  };

  const sampleComments = [
    {
      _id: 'comment-1',
      content: 'This architecture is exceptionally clean and well-structured!',
      author: {
        _id: 'author-1',
        name: 'Sarah Connor',
        avatar: null
      },
      createdAt: '2026-11-04T10:00:00.000Z',
      isEdited: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(NotificationContextModule.useNotification).mockReturnValue({
      socket: mockSocket,
      showToast: mockShowToast
    });
  });

  it('fetches and renders existing comments for a post', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false
    });

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: sampleComments }
    });

    render(
      <BrowserRouter>
        <CommentSection postId="post-test-123" />
      </BrowserRouter>
    );

    // Wait for comment to appear
    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(
        screen.getByText('This architecture is exceptionally clean and well-structured!')
      ).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/comments/post/post-test-123');
  });

  it('displays sign in prompt for unauthenticated users', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false
    });

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: [] }
    });

    render(
      <BrowserRouter>
        <CommentSection postId="post-test-123" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sign in to join the conversation/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
    });
  });

  it('renders comment form and handles submission when authenticated', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { _id: 'user-99', name: 'Dev Engineer', email: 'dev@example.com' },
      isAuthenticated: true,
      isAdmin: false
    });

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: [] }
    });

    const newCommentResponse = {
      _id: 'comment-2',
      content: 'Socket.io broadcast latency is ultra-fast.',
      author: {
        _id: 'user-99',
        name: 'Dev Engineer'
      },
      createdAt: new Date().toISOString()
    };

    vi.mocked(api.post).mockResolvedValueOnce({
      data: { data: newCommentResponse }
    });

    render(
      <BrowserRouter>
        <CommentSection postId="post-test-123" />
      </BrowserRouter>
    );

    // Wait until loading finishes
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Share your thoughts/i)).toBeInTheDocument();
    });

    // Type comment
    const textarea = screen.getByPlaceholderText(/Share your thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Socket.io broadcast latency is ultra-fast.' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Comment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/comments/post/post-test-123', {
        content: 'Socket.io broadcast latency is ultra-fast.'
      });
      expect(mockShowToast).toHaveBeenCalledWith('Comment posted successfully!', 'success');
      expect(screen.getByText('Socket.io broadcast latency is ultra-fast.')).toBeInTheDocument();
    });
  });
});
