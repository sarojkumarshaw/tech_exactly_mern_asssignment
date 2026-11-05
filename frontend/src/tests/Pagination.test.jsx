import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Pagination } from '../components/Pagination';

describe('Pagination Component', () => {
  it('returns null if totalPages <= 1', () => {
    const { container } = render(
      <Pagination pagination={{ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false }} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders page numbers and controls when totalPages > 1', () => {
    const pagination = { page: 2, totalPages: 5, hasNextPage: true, hasPrevPage: true };
    render(<Pagination pagination={pagination} onPageChange={vi.fn()} />);

    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onPageChange when page button is clicked', () => {
    const onPageChange = vi.fn();
    const pagination = { page: 1, totalPages: 3, hasNextPage: true, hasPrevPage: false };
    render(<Pagination pagination={pagination} onPageChange={onPageChange} />);

    // Click Next
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(2);

    // Click page 3
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables Prev button on first page and Next button on last page', () => {
    const pagination = { page: 1, totalPages: 3, hasNextPage: true, hasPrevPage: false };
    const { rerender } = render(<Pagination pagination={pagination} onPageChange={vi.fn()} />);

    expect(screen.getByText('Prev').closest('button')).toBeDisabled();
    expect(screen.getByText('Next').closest('button')).not.toBeDisabled();

    // Rerender on last page
    rerender(
      <Pagination
        pagination={{ page: 3, totalPages: 3, hasNextPage: false, hasPrevPage: true }}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText('Prev').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Next').closest('button')).toBeDisabled();
  });
});

