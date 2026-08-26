import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChoreDutyView } from './ChoreDutyView';
import { ChoreAssignment, Member } from '../types';

describe('ChoreDutyView Component', () => {
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

  const mockAssignments: ChoreAssignment[] = [
    {
      id: 'a-1',
      chore_id: 'c-1',
      member_id: 'm-1',
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'c-1',
        household_id: 'h-1',
        title: 'Deep Clean Bathroom',
        description: 'Scrub tub, sink, and toilet',
        effort_weight: 3,
        completion_type: 'single_weekly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: currentMember,
    },
    {
      id: 'a-2',
      chore_id: 'c-2',
      member_id: 'm-1',
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'c-2',
        household_id: 'h-1',
        title: 'Kitchen Trash & Recycling',
        description: 'Take bins to curb and replace bags',
        effort_weight: 1,
        completion_type: 'continuous_duty',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: currentMember,
    },
    {
      id: 'a-3',
      chore_id: 'c-3',
      member_id: 'm-2',
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: {
        id: 'c-3',
        household_id: 'h-1',
        title: 'Vacuum Common Areas',
        description: 'Living room and hallway',
        effort_weight: 2,
        completion_type: 'single_weekly',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: otherMember,
    },
  ];

  const mockOnCompleteChore = vi.fn();
  const mockOnLogDuty = vi.fn();
  const mockOnToggleAway = vi.fn();
  const mockOnOpenSwap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weekly chores grouped by roommate', () => {
    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onOpenSwap={mockOnOpenSwap}
      />
    );

    expect(screen.getByText('Deep Clean Bathroom')).toBeInTheDocument();
    expect(screen.getByText('Kitchen Trash & Recycling')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Common Areas')).toBeInTheDocument();
    expect(screen.getByText(/Alex/i)).toBeInTheDocument();
    expect(screen.getByText(/Sam/i)).toBeInTheDocument();
  });

  it('completes single_weekly chore on 1-tap Mark Done', async () => {
    const user = userEvent.setup();
    mockOnCompleteChore.mockResolvedValueOnce(undefined);

    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onOpenSwap={mockOnOpenSwap}
      />
    );

    const markDoneBtn = screen.getByRole('button', { name: /mark done/i });
    await user.click(markDoneBtn);

    expect(mockOnCompleteChore).toHaveBeenCalledWith('a-1');
  });

  it('opens log duty modal and logs duty instance for continuous_duty chore', async () => {
    const user = userEvent.setup();
    mockOnLogDuty.mockResolvedValueOnce(undefined);

    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onOpenSwap={mockOnOpenSwap}
      />
    );

    const logDutyBtn = screen.getByRole('button', { name: /\+ log duty|log instance/i });
    await user.click(logDutyBtn);

    expect(screen.getByPlaceholderText(/optional note/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/optional note/i), 'Emptied recycling and trash');

    const submitLogBtn = screen.getByRole('button', { name: /^submit log$/i });
    await user.click(submitLogBtn);

    expect(mockOnLogDuty).toHaveBeenCalledWith('a-2', 'Emptied recycling and trash');
  });

  it('toggles away status when Set Away button is clicked', async () => {
    const user = userEvent.setup();
    mockOnToggleAway.mockResolvedValueOnce(undefined);

    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onOpenSwap={mockOnOpenSwap}
      />
    );

    const awayBtn = screen.getByRole('button', { name: /set away|mark away/i });
    await user.click(awayBtn);

    expect(mockOnToggleAway).toHaveBeenCalledWith('away');
  });
});
