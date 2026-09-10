import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusStamp } from './StatusStamp';

describe('StatusStamp', () => {
  it('renders with role="status" and accessible aria-label', () => {
    render(<StatusStamp status="clean" />);
    const stamp = screen.getByRole('status');
    expect(stamp).toBeInTheDocument();
    expect(stamp).toHaveAttribute('aria-label', 'Status: CLEAN');
    expect(stamp).toHaveTextContent('CLEAN');
  });

  it('renders label uppercase with monospaced font and tracking', () => {
    render(<StatusStamp status="running" />);
    const stamp = screen.getByRole('status');
    expect(stamp).toHaveTextContent('RUNNING');
    expect(stamp.className).toMatch(/font-mono/);
    expect(stamp.className).toMatch(/tracking-wide/);
    expect(stamp.className).toMatch(/uppercase/);
  });

  it('applies transparent interior with no solid background fill', () => {
    render(<StatusStamp status="dirty" />);
    const stamp = screen.getByRole('status');
    expect(stamp.className).toMatch(/bg-transparent/);
    expect(stamp.className).not.toMatch(/bg-(white|black|slate|emerald|red|amber|gray)-[0-9]+/);
  });

  it('applies 1.5px dashed border matching status colors by default', () => {
    const { rerender } = render(<StatusStamp status="clean" />);
    let stamp = screen.getByRole('status');
    expect(stamp.className).toMatch(/border-\[1\.5px\]/);
    expect(stamp.className).toMatch(/border-dashed/);
    expect(stamp.className).toMatch(/(accent-sage|stamp-clean)/);

    rerender(<StatusStamp status="running" />);
    stamp = screen.getByRole('status');
    expect(stamp.className).toMatch(/(accent-slate|accent-terracotta|stamp-running)/);

    rerender(<StatusStamp status="dirty" />);
    stamp = screen.getByRole('status');
    expect(stamp.className).toMatch(/(accent-crimson|stamp-dirty)/);

    rerender(<StatusStamp status="clean_needs_emptying" />);
    stamp = screen.getByRole('status');
    expect(stamp.className).toMatch(/(accent-ochre|stamp-empty)/);
  });

  it('supports double border styling via borderStyle prop', () => {
    render(<StatusStamp status="clean" borderStyle="double" />);
    const stamp = screen.getByRole('status');
    expect(stamp.className).toMatch(/border-double/);
  });

  it('restricts default organic rotation within ±1.5°', () => {
    const statuses = ['clean', 'dirty', 'running', 'empty', 'clean_needs_emptying'] as const;
    for (const status of statuses) {
      const { unmount } = render(<StatusStamp status={status} data-testid={`stamp-${status}`} />);
      const el = screen.getByTestId(`stamp-${status}`);
      const transform = el.style.transform;
      const match = transform.match(/rotate\((-?[\d.]+)deg\)/);
      expect(match).not.toBeNull();
      const deg = parseFloat(match![1]);
      expect(deg).toBeGreaterThanOrEqual(-1.5);
      expect(deg).toBeLessThanOrEqual(1.5);
      unmount();
    }
  });

  it('accepts custom rotation prop', () => {
    render(<StatusStamp status="clean" rotation={-1.2} data-testid="custom-rotate-stamp" />);
    const stamp = screen.getByTestId('custom-rotate-stamp');
    expect(stamp.style.transform).toContain('rotate(-1.2deg)');
  });

  it('renders sublabel and custom label when provided', () => {
    render(
      <StatusStamp
        status="clean"
        label="SPARKLING CLEAN"
        sublabel="Cycle done 10m ago"
      />
    );
    const stamp = screen.getByRole('status');
    expect(stamp).toHaveTextContent('SPARKLING CLEAN');
    expect(stamp).toHaveTextContent('Cycle done 10m ago');
    expect(stamp).toHaveAttribute(
      'aria-label',
      'Status: SPARKLING CLEAN - Cycle done 10m ago'
    );
  });

  it('renders default label "EMPTY" for empty status', () => {
    render(<StatusStamp status="empty" />);
    const stamp = screen.getByRole('status');
    expect(stamp).toHaveTextContent('EMPTY');
    expect(stamp).toHaveAttribute('aria-label', 'Status: EMPTY');
  });
});
