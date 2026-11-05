import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Footer } from '../components/Footer';

describe('Footer Component', () => {
  it('renders Tech Exactly branding and logo', () => {
    render(<Footer />);

    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Exactly')).toBeInTheDocument();
  });

  it('renders technology stack badges', () => {
    render(<Footer />);

    expect(screen.getByText('MongoDB')).toBeInTheDocument();
    expect(screen.getByText('Express.js')).toBeInTheDocument();
    expect(screen.getByText('React 18')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Socket.io')).toBeInTheDocument();
    expect(screen.getByText('RBAC & JWT')).toBeInTheDocument();
  });

  it('renders assignment dedication text', () => {
    render(<Footer />);

    expect(screen.getByText(/for Tech Exactly Assignment/i)).toBeInTheDocument();
  });
});

