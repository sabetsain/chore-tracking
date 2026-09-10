import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RubberStampBadge } from './RubberStampBadge';

describe('RubberStampBadge Component', () => {
  it('renders all canonical states with default labels and accessible roles', () => {
    const { rerender } = render(<RubberStampBadge status="empty" />);
    expect(screen.getByRole('status')).toHaveTextContent('READY TO RUN!');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: READY TO RUN!');

    rerender(<RubberStampBadge status="dirty" />);
    expect(screen.getByRole('status')).toHaveTextContent('DIRTY / LOAD');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: DIRTY / LOAD');

    rerender(<RubberStampBadge status="running" />);
    expect(screen.getByRole('status')).toHaveTextContent('CYCLE IN PROGRESS');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: CYCLE IN PROGRESS');

    rerender(<RubberStampBadge status="needs_attention" />);
    expect(screen.getByRole('status')).toHaveTextContent('NEEDS EMPTYING');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: NEEDS EMPTYING');

    rerender(<RubberStampBadge status="clean" />);
    expect(screen.getByRole('status')).toHaveTextContent('CLEAN & READY');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: CLEAN & READY');
  });

  it('maps legacy clean_needs_emptying alias to NEEDS EMPTYING', () => {
    render(<RubberStampBadge status="clean_needs_emptying" />);
    expect(screen.getByRole('status')).toHaveTextContent('NEEDS EMPTYING');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: NEEDS EMPTYING');
  });

  it('renders with custom label and sublabel', () => {
    render(
      <RubberStampBadge
        status="running"
        label="EXPRESS CYCLE"
        sublabel="15m remaining"
      />
    );
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('EXPRESS CYCLE');
    expect(badge).toHaveTextContent('15m remaining');
    expect(badge).toHaveAttribute('aria-label', 'Status: EXPRESS CYCLE - 15m remaining');
  });

  it('applies custom rotation angle when provided', () => {
    render(<RubberStampBadge status="clean" rotation={3.5} />);
    const badge = screen.getByRole('status');
    expect(badge.style.transform).toContain('rotate(3.5deg)');
  });
});
