import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TechExactlyLogo from '../components/TechExactlyLogo';

describe('TechExactlyLogo Component', () => {
  it('renders precision Tech Exactly monogram logo', () => {
    render(<TechExactlyLogo size="md" showText={true} />);
    
    // Check that Tech Exactly text is visible
    expect(screen.getByText(/Tech/i)).toBeInTheDocument();
    expect(screen.getByText(/Exactly/i)).toBeInTheDocument();
  });

  it('renders monogram mark only when showText is false', () => {
    const { container } = render(<TechExactlyLogo size="sm" showText={false} />);
    
    // Monogram icon wrapper should be rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(screen.queryByText(/Platform/i)).not.toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    const { container } = render(<TechExactlyLogo className="custom-test-class" />);
    const rootDiv = container.firstChild;
    expect(rootDiv).toHaveClass('custom-test-class');
  });
});
