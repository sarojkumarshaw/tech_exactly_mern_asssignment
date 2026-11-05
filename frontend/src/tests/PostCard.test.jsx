import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { PostCard } from '../components/PostCard';

const mockPost = {
  _id: 'post-123',
  title: 'Mastering Event-Driven Architectures in Node.js',
  slug: 'mastering-event-driven-architectures-nodejs',
  content: 'Learn how to build scalable event-driven applications using Socket.io and Redis pub/sub.',
  excerpt: 'A comprehensive guide to asynchronous messaging and event loops in modern enterprise systems.',
  category: 'Backend',
  tags: ['Node.js', 'Socket.io', 'Architecture'],
  coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
  author: {
    name: 'Jane Doe',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
  },
  viewsCount: 1420,
  commentsCount: 38,
  createdAt: '2026-11-01T12:00:00.000Z',
  isDeleted: false
};

describe('PostCard Component', () => {
  it('renders post title, excerpt, and category badge', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Mastering Event-Driven Architectures in Node.js')).toBeInTheDocument();
    expect(
      screen.getByText('A comprehensive guide to asynchronous messaging and event loops in modern enterprise systems.')
    ).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('renders tags and author information correctly', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Socket.io')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('1420')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
  });

  it('renders "Soft Deleted" badge when post.isDeleted is true', () => {
    const deletedPost = { ...mockPost, isDeleted: true };
    render(
      <BrowserRouter>
        <PostCard post={deletedPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Soft Deleted')).toBeInTheDocument();
  });

  it('links to the correct post slug route', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    const postLink = screen.getByRole('link', { name: /Mastering Event-Driven Architectures/i });
    expect(postLink).toHaveAttribute('href', '/posts/mastering-event-driven-architectures-nodejs');
  });

  it('falls back to default author initial if avatar is not provided', () => {
    const noAvatarPost = {
      ...mockPost,
      author: { name: 'Bob Smith', avatar: null }
    };
    render(
      <BrowserRouter>
        <PostCard post={noAvatarPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });
});

