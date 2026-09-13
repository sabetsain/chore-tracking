import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChoreCard } from './ChoreCard';
import { ChoreAssignment, Member } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { soundEngine } from '../utils/soundEngine';

describe('ChoreCard Component', () => {
  const currentMember: Member = {
    id: 'm-1',
    household_id: 'h-1',
    nickname: 'Alex',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const otherMember: Member = {
    id: 'm-2',
    household_id: 'h-1',
    nickname: 'Sam',
    role: 'member',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const singleWeeklyChoreAssignment: ChoreAssignment = {
    id: 'asg-1',
    chore_id: 'ch-1',
    member_id: 'm-1',
    week_start_date: '2026-08-24',
    status: 'pending',
    chore: {
      id: 'ch-1',
      household_id: 'h-1',
      title: 'Deep Clean Bathroom',
      description: 'Scrub tub, sink, and tiles',
      effort_weight: 3,
      completion_type: 'single_weekly',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    member: currentMember,
  };

  const continuousChoreAssignment: ChoreAssignment = {
    id: 'asg-2',
    chore_id: 'ch-2',
    member_id: 'm-1',
    week_start_date: '2026-08-24',
    status: 'pending',
    chore: {
      id: 'ch-2',
      household_id: 'h-1',
      title: 'Kitchen Trash & Recycling',
      description: 'Take out bins and replace bags',
      effort_weight: 1,
      completion_type: 'continuous_duty',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    member: currentMember,
    duty_instances_count: 2,
  };

  const mockOnComplete = vi.fn();
  const mockOnUncomplete = vi.fn();
  const mockOnLogDuty = vi.fn();
  const mockOnUnclaim = vi.fn();
  const mockOnClaim = vi.fn();
  const mockOnSwap = vi.fn();
  const mockOnReassign = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mine variant', () => {
    it('renders chore card with title, points, description, and identity sticker', () => {
      render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          allMembers={[currentMember, otherMember]}
          onComplete={mockOnComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Deep Clean Bathroom')).toBeInTheDocument();
      expect(screen.getByText('Scrub tub, sink, and tiles')).toBeInTheDocument();
      expect(screen.getByText('3 pts')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Alex's sticker/i })).toBeInTheDocument();
      expect(screen.getByText('Weekly check-off')).toBeInTheDocument();
    });

    it('handles Mark Done click, triggers sound, confetti, and onComplete', async () => {
      const user = userEvent.setup();
      const woodClickSpy = vi.spyOn(soundEffects, 'playWoodClick');
      mockOnComplete.mockResolvedValueOnce(undefined);

      render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          onComplete={mockOnComplete}
        />
      );

      const markDoneBtn = screen.getByRole('button', { name: /mark done/i });
      expect(markDoneBtn.className).toContain('min-h-[44px]');
      expect(markDoneBtn.className).toContain('bg-accent-sage');

      await user.click(markDoneBtn);

      expect(woodClickSpy).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalledWith('asg-1');
    });

    it('handles checkbox toggle for completion and uncompletion', async () => {
      const user = userEvent.setup();
      mockOnComplete.mockResolvedValueOnce(undefined);

      const { rerender } = render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          onComplete={mockOnComplete}
          onUncomplete={mockOnUncomplete}
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /Deep Clean Bathroom/i });
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(mockOnComplete).toHaveBeenCalledWith('asg-1');

      // Rerender as completed
      const completedAssignment: ChoreAssignment = {
        ...singleWeeklyChoreAssignment,
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      rerender(
        <ChoreCard
          variant="mine"
          assignment={completedAssignment}
          currentMember={currentMember}
          onComplete={mockOnComplete}
          onUncomplete={mockOnUncomplete}
        />
      );

      const checkedCheckbox = screen.getByRole('checkbox', { name: /Deep Clean Bathroom/i });
      expect(checkedCheckbox).toBeChecked();

      // Click Undo button
      const undoBtn = screen.getByRole('button', { name: /undo chore completion/i });
      expect(undoBtn.className).toContain('min-h-[44px]');
      await user.click(undoBtn);
      expect(mockOnUncomplete).toHaveBeenCalledWith('asg-1');
    });

    it('handles continuous_duty log duty button', async () => {
      const user = userEvent.setup();

      render(
        <ChoreCard
          variant="mine"
          assignment={continuousChoreAssignment}
          currentMember={currentMember}
          onLogDuty={mockOnLogDuty}
        />
      );

      expect(screen.getByText('Continuous duty')).toBeInTheDocument();
      const logBtn = screen.getByRole('button', { name: /\+ log duty/i });
      expect(logBtn.className).toContain('min-h-[44px]');

      await user.click(logBtn);
      expect(mockOnLogDuty).toHaveBeenCalledWith(continuousChoreAssignment);
    });

    it('handles release/unclaim action when rotation is paused', async () => {
      const user = userEvent.setup();
      mockOnUnclaim.mockResolvedValueOnce(undefined);

      render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          isRotationActive={false}
          onUnclaim={mockOnUnclaim}
        />
      );

      const unclaimBtn = screen.getByRole('button', { name: /release or unclaim chore/i });
      expect(unclaimBtn.className).toContain('min-h-[44px]');

      await user.click(unclaimBtn);
      expect(mockOnUnclaim).toHaveBeenCalledWith('asg-1');
    });

    it('does not render release/unclaim button when rotation is active', () => {
      render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          isRotationActive={true}
          onUnclaim={mockOnUnclaim}
        />
      );

      expect(screen.queryByRole('button', { name: /release or unclaim chore/i })).not.toBeInTheDocument();
    });

    it('handles swap button click', async () => {
      const user = userEvent.setup();

      render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          onSwap={mockOnSwap}
        />
      );

      const swapBtn = screen.getByRole('button', { name: /swap chore/i });
      expect(swapBtn.className).toContain('min-h-[44px]');

      await user.click(swapBtn);
      expect(mockOnSwap).toHaveBeenCalledWith(singleWeeklyChoreAssignment);
    });

    it('handles reassignment select dropdown change', async () => {
      const user = userEvent.setup();
      mockOnReassign.mockResolvedValueOnce(undefined);

      render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          allMembers={[currentMember, otherMember]}
          onReassign={mockOnReassign}
        />
      );

      const select = screen.getByRole('combobox', { name: /reassign deep clean bathroom/i });
      await user.selectOptions(select, 'm-2');

      expect(mockOnReassign).toHaveBeenCalledWith('asg-1', 'm-2');
    });

    it('handles edit and delete actions with confirmation prompt and sound', async () => {
      const user = userEvent.setup();
      const eraserSpy = vi.spyOn(soundEngine, 'playEraserSound');
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockOnDelete.mockResolvedValueOnce(undefined);

      render(
        <ChoreCard
          variant="mine"
          assignment={singleWeeklyChoreAssignment}
          currentMember={currentMember}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editBtn = screen.getByRole('button', { name: /edit deep clean bathroom/i });
      await user.click(editBtn);
      expect(mockOnEdit).toHaveBeenCalledWith(singleWeeklyChoreAssignment.chore);

      const deleteBtn = screen.getByRole('button', { name: /delete deep clean bathroom/i });
      await user.click(deleteBtn);
      expect(window.confirm).toHaveBeenCalled();
      expect(eraserSpy).toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalledWith('ch-1');
    });
  });

  describe('roommate variant', () => {
    const roommateAssignment: ChoreAssignment = {
      ...singleWeeklyChoreAssignment,
      id: 'asg-roommate',
      member_id: 'm-2',
      member: otherMember,
    };

    it('renders read-only status with disabled checkbox', async () => {
      const user = userEvent.setup();

      render(
        <ChoreCard
          variant="roommate"
          assignment={roommateAssignment}
          currentMember={currentMember}
          allMembers={[currentMember, otherMember]}
          onComplete={mockOnComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /Deep Clean Bathroom/i });
      expect(checkbox).toBeDisabled();

      await user.click(checkbox);
      expect(mockOnComplete).not.toHaveBeenCalled();

      expect(screen.getByRole('img', { name: /Sam's sticker/i })).toBeInTheDocument();
    });

    it('supports edit and delete buttons on roommate cards', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <ChoreCard
          variant="roommate"
          assignment={roommateAssignment}
          currentMember={currentMember}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editBtn = screen.getByRole('button', { name: /edit deep clean bathroom/i });
      await user.click(editBtn);
      expect(mockOnEdit).toHaveBeenCalledWith(roommateAssignment.chore);

      const deleteBtn = screen.getByRole('button', { name: /delete deep clean bathroom/i });
      await user.click(deleteBtn);
      expect(mockOnDelete).toHaveBeenCalledWith('ch-1');
    });
  });

  describe('pool variant', () => {
    const poolAssignment: ChoreAssignment = {
      id: 'asg-pool-1',
      chore_id: 'ch-pool-1',
      member_id: null,
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'ch-pool-1',
        household_id: 'h-1',
        title: 'Mow Front Lawn',
        description: 'Mow grass and edge the sidewalk',
        effort_weight: 4,
        completion_type: 'single_weekly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: null,
    };

    it('renders pool chore with Unassigned badge and Claim button', async () => {
      const user = userEvent.setup();
      const woodClickSpy = vi.spyOn(soundEffects, 'playWoodClick');
      const tapePeelSpy = vi.spyOn(soundEngine, 'playTapePeelSound');
      mockOnClaim.mockResolvedValueOnce(undefined);

      render(
        <ChoreCard
          variant="pool"
          assignment={poolAssignment}
          onClaim={mockOnClaim}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Mow Front Lawn')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();

      const claimBtn = screen.getByRole('button', { name: /claim chore/i });
      expect(claimBtn.className).toContain('min-h-[44px]');

      await user.click(claimBtn);

      expect(woodClickSpy).toHaveBeenCalled();
      expect(tapePeelSpy).toHaveBeenCalled();
      expect(mockOnClaim).toHaveBeenCalledWith('asg-pool-1');
    });

    it('renders Away badge when chore belongs to an away roommate', () => {
      const awayAssignment: ChoreAssignment = {
        ...poolAssignment,
        member_id: 'm-2',
        member: { ...otherMember, status: 'away' },
      };

      render(
        <ChoreCard
          variant="pool"
          assignment={awayAssignment}
          onClaim={mockOnClaim}
        />
      );

      expect(screen.getByText(/Sam \(Away\)/i)).toBeInTheDocument();
    });
  });
});
