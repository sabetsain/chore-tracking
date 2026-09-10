import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpForGrabsPool } from './UpForGrabsPool';
import { ChoreSwapModal } from './ChoreSwapModal';
import { ChoreAssignment, Member } from '../types';

describe('UpForGrabsPool & ChoreSwapModal Components', () => {
  const currentMember: Member = {
    id: 'm-1',
    household_id: 'h-1',
    nickname: 'Alex',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const awayMember: Member = {
    id: 'm-2',
    household_id: 'h-1',
    nickname: 'Taylor',
    role: 'member',
    status: 'away',
    created_at: new Date().toISOString(),
  };

  const mockUpForGrabs: ChoreAssignment[] = [
    {
      id: 'a-open-1',
      chore_id: 'c-10',
      member_id: null,
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'c-10',
        household_id: 'h-1',
        title: 'Mow the Lawn',
        description: 'Front and back yard',
        effort_weight: 4,
        completion_type: 'single_weekly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: null,
    },
    {
      id: 'a-open-2',
      chore_id: 'c-11',
      member_id: 'm-2',
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'c-11',
        household_id: 'h-1',
        title: 'Clean Kitchen Stovetop',
        description: 'Degrease cooktop and oven exterior',
        effort_weight: 2,
        completion_type: 'single_weekly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: awayMember,
    },
  ];

  const myAssignments: ChoreAssignment[] = [
    {
      id: 'my-1',
      chore_id: 'c-1',
      member_id: 'm-1',
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'c-1',
        household_id: 'h-1',
        title: 'Deep Clean Bathroom',
        effort_weight: 3,
        completion_type: 'single_weekly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: currentMember,
    },
  ];

  const mockOnClaim = vi.fn();
  const mockOnSwap = vi.fn();
  const mockOnCloseModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders up-for-grabs chores and triggers claim action', async () => {
    const user = userEvent.setup();
    const { soundEffects } = await import('../utils/soundEffects');
    const woodClickSpy = vi.spyOn(soundEffects, 'playWoodClick');
    mockOnClaim.mockResolvedValueOnce(undefined);

    render(
      <UpForGrabsPool
        chores={mockUpForGrabs}
        onClaimChore={mockOnClaim}
      />
    );

    expect(screen.getByText('Mow the Lawn')).toBeInTheDocument();
    expect(screen.getByText('Clean Kitchen Stovetop')).toBeInTheDocument();
    expect(screen.getByText(/Taylor \(Away\)/i)).toBeInTheDocument();

    const claimButtons = screen.getAllByRole('button', { name: /claim chore|claim/i });
    await user.click(claimButtons[0]);

    expect(mockOnClaim).toHaveBeenCalledWith('a-open-1');
    expect(woodClickSpy).toHaveBeenCalled();
  });

  it('submits chore swap in ChoreSwapModal', async () => {
    const user = userEvent.setup();
    mockOnSwap.mockResolvedValueOnce(undefined);

    const targetAssignment: ChoreAssignment = {
      id: 'target-1',
      chore_id: 'c-5',
      member_id: 'm-3',
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'c-5',
        household_id: 'h-1',
        title: 'Water Balcony Plants',
        effort_weight: 1,
        completion_type: 'single_weekly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: {
        id: 'm-3',
        household_id: 'h-1',
        nickname: 'Casey',
        role: 'member',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    };

    render(
      <ChoreSwapModal
        sourceAssignment={myAssignments[0]}
        availableTargets={[targetAssignment]}
        onClose={mockOnCloseModal}
        onSwap={mockOnSwap}
      />
    );

    expect(screen.getByText(/Swap Chore Assignment/i)).toBeInTheDocument();
    expect(screen.getByText(/Deep Clean Bathroom/i)).toBeInTheDocument();
    expect(screen.getByText(/Water Balcony Plants/i)).toBeInTheDocument();

    const swapBtn = screen.getByRole('button', { name: /^confirm swap$/i });
    await user.click(swapBtn);

    expect(mockOnSwap).toHaveBeenCalledWith('my-1', 'target-1');
  });
});
