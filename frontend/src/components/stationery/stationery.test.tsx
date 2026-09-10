import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  RubberStampBadge,
  StatusStamp,
  IdentitySticker,
  PaperCard,
  ScribbleCheckbox,
  TallyCounter,
  NotebookTab,
} from './index';

describe('Stationery Primitives', () => {
  describe('RubberStampBadge', () => {
    it('renders with state clean and accessible status role', () => {
      render(<RubberStampBadge status="clean" />);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('CLEAN');
      expect(badge).toHaveAttribute('aria-label', 'Status: CLEAN');
    });

    it('renders with state dirty, running, and clean_needs_emptying', () => {
      const { rerender } = render(<RubberStampBadge status="dirty" />);
      expect(screen.getByRole('status')).toHaveTextContent('DIRTY');

      rerender(<RubberStampBadge status="running" />);
      expect(screen.getByRole('status')).toHaveTextContent('RUNNING');

      rerender(<RubberStampBadge status="clean_needs_emptying" />);
      expect(screen.getByRole('status')).toHaveTextContent('CLEAN - NEEDS EMPTYING');

      rerender(<RubberStampBadge status="empty" />);
      expect(screen.getByRole('status')).toHaveTextContent('READY TO RUN!');
    });

    it('renders with custom label, sublabel, and rotation', () => {
      render(
        <RubberStampBadge
          status="clean"
          label="ALL CLEAN"
          sublabel="DONE BY ALEX"
          rotation={4.5}
        />
      );
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('ALL CLEAN');
      expect(badge).toHaveTextContent('DONE BY ALEX');
      expect(badge).toHaveAttribute('aria-label', 'Status: ALL CLEAN - DONE BY ALEX');
      expect(badge.style.transform).toContain('rotate(4.5deg)');
    });
  });

  describe('PaperCard', () => {
    it('renders children and applies base styles', () => {
      render(
        <PaperCard data-testid="test-card">
          <p>Card Content</p>
        </PaperCard>
      );
      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Card Content');
    });

    it('supports tilt and variant props', () => {
      const { rerender } = render(
        <PaperCard data-testid="test-card" tilt="left" variant="postit" />
      );
      const card = screen.getByTestId('test-card');
      expect(card.className).toContain('bg-paper-postit');
      expect(card.className).toContain('-rotate-[0.4deg]');

      rerender(<PaperCard data-testid="test-card" tilt="right" variant="manila" lifted />);
      expect(card.className).toContain('bg-paper-manila');
      expect(card.className).toContain('rotate-[0.6deg]');
      expect(card.className).toContain('shadow-paper-lifted');
    });

    it('applies soft porcelain canvas surface and stone hairline border by default', () => {
      render(
        <PaperCard data-testid="modern-card">
          <p>Modern Porcelain Content</p>
        </PaperCard>
      );
      const card = screen.getByTestId('modern-card');
      expect(card.className).toContain('bg-[var(--canvas-card,#FDFAF6)]');
      expect(card.className).toContain('border-[var(--border-stone,#E3DDD5)]');
    });

    it('supports polymorphic as prop', () => {
      render(<PaperCard as="article" data-testid="article-card">Content</PaperCard>);
      const el = screen.getByTestId('article-card');
      expect(el.tagName.toLowerCase()).toBe('article');
    });
  });

  describe('StatusStamp & IdentitySticker exports', () => {
    it('renders exported StatusStamp from index', () => {
      render(<StatusStamp status="clean" />);
      const stamp = screen.getByRole('status');
      expect(stamp).toBeInTheDocument();
      expect(stamp).toHaveTextContent('CLEAN');
    });

    it('renders exported IdentitySticker from index', () => {
      render(<IdentitySticker glyph="☕" name="Alex" showLabel />);
      expect(screen.getByRole('img')).toHaveTextContent('☕');
      expect(screen.getByText('Alex')).toBeInTheDocument();
    });
  });

  describe('ScribbleCheckbox', () => {
    it('renders unchecked and checked states and supports toggling both ways', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <ScribbleCheckbox checked={false} onChange={handleChange} label="Clean counters" />
      );

      const checkbox = screen.getByRole('checkbox', { name: /Clean counters/i });
      expect(checkbox).not.toBeChecked();

      // Check: clicking unchecked calls onChange(true)
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);

      // Re-render as checked
      rerender(<ScribbleCheckbox checked={true} onChange={handleChange} label="Clean counters" />);
      expect(checkbox).toBeChecked();

      // Uncheck: clicking checked calls onChange(false)
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('handles disabled state and prevents interactions', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ScribbleCheckbox
          checked={false}
          disabled
          onChange={handleChange}
          label="Disabled chore"
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /Disabled chore/i });
      expect(checkbox).toBeDisabled();

      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('TallyCounter', () => {
    it('renders 0 count label when count is 0', () => {
      render(<TallyCounter count={0} label="runs" />);
      const tally = screen.getByRole('img');
      expect(tally).toHaveAttribute('aria-label', 'Tally count: 0 runs');
      expect(tally).toHaveTextContent('0 runs');
    });

    it('renders tally clusters for non-zero counts', () => {
      const { container } = render(<TallyCounter count={7} label="duties" />);
      const tally = screen.getByRole('img');
      expect(tally).toHaveAttribute('aria-label', 'Tally count: 7 duties');
      expect(screen.getByText('(7 duties)')).toBeInTheDocument();

      // 7 = 1 full cluster (5) + 1 remainder cluster (2)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });

    it('renders correct cluster count for multiples of 5', () => {
      const { container } = render(<TallyCounter count={15} />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3);
    });
  });

  describe('NotebookTab', () => {
    it('renders tab with label, active state, and accessibility attributes', () => {
      render(<NotebookTab label="Appliances" isActive={true} id="tab-appliances" />);
      const tab = screen.getByRole('tab', { name: /Appliances/i });
      expect(tab).toBeInTheDocument();
      expect(tab).toHaveAttribute('aria-selected', 'true');
      expect(tab).toHaveAttribute('tabindex', '0');
    });

    it('renders inactive tab and responds to click', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <NotebookTab
          label="Chores"
          isActive={false}
          badgeCount={3}
          onClick={handleClick}
        />
      );

      const tab = screen.getByRole('tab', { name: /Chores/i });
      expect(tab).toHaveAttribute('aria-selected', 'false');
      expect(tab).toHaveAttribute('tabindex', '-1');
      expect(screen.getByText('3')).toBeInTheDocument();

      await user.click(tab);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
