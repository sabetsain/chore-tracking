import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChoreDutyView } from './ChoreDutyView';
import { EditChoreModal } from './EditChoreModal';
import { UpForGrabsPool } from './UpForGrabsPool';
import { Chore, ChoreAssignment, Household, Member } from '../types';

describe('ChoreDutyView & Management Components', () => {
  const currentMember: Member = {
    id: 'm-1',
    household_id: 'h-1',
    nickname: 'Alex',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const sampleChore: Chore = {
    id: 'c-1',
    household_id: 'h-1',
    title: 'Clean Microwave',
    description: 'Wipe inside with lemon water',
    effort_weight: 2,
    completion_type: 'single_weekly',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const sampleAssignment: ChoreAssignment = {
    id: 'a-1',
    chore_id: 'c-1',
    member_id: 'm-1',
    week_start_date: '2026-08-24',
    status: 'pending',
    chore: sampleChore,
    member: currentMember,
  };

  const inactiveHousehold: Household = {
    id: 'h-1',
    name: 'Stationery House',
    invite_code: 'STAT12',
    timezone: 'UTC',
    chore_rotation_active: false,
    created_at: new Date().toISOString(),
  };

  const activeHousehold: Household = {
    ...inactiveHousehold,
    chore_rotation_active: true,
  };

  const mockOnCompleteChore = vi.fn();
  const mockOnLogDuty = vi.fn();
  const mockOnToggleAway = vi.fn();
  const mockOnUnclaimChore = vi.fn();
  const mockOnEditChore = vi.fn();
  const mockOnDeleteChore = vi.fn();
  const mockOnUpdateChore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Unclaim button when rotation is inactive and clicking it triggers onUnclaimChore', async () => {
    const user = userEvent.setup();

    render(
      <ChoreDutyView
        currentMember={currentMember}
        household={inactiveHousehold}
        assignments={[sampleAssignment]}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onUnclaimChore={mockOnUnclaimChore}
        onEditChore={mockOnEditChore}
      />
    );

    const unclaimBtn = screen.getByRole('button', { name: /release or unclaim chore/i });
    expect(unclaimBtn).toBeInTheDocument();

    await user.click(unclaimBtn);
    expect(mockOnUnclaimChore).toHaveBeenCalledWith('a-1');
  });

  it('does NOT render Unclaim button when rotation is active', () => {
    render(
      <ChoreDutyView
        currentMember={currentMember}
        household={activeHousehold}
        assignments={[sampleAssignment]}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onUnclaimChore={mockOnUnclaimChore}
        onEditChore={mockOnEditChore}
      />
    );

    expect(screen.queryByRole('button', { name: /release or unclaim chore/i })).not.toBeInTheDocument();
  });

  it('renders Edit button on chore cards and clicking it invokes onEditChore', async () => {
    const user = userEvent.setup();

    render(
      <ChoreDutyView
        currentMember={currentMember}
        household={inactiveHousehold}
        assignments={[sampleAssignment]}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onEditChore={mockOnEditChore}
      />
    );

    const editBtn = screen.getByRole('button', { name: /edit clean microwave/i });
    expect(editBtn).toBeInTheDocument();

    await user.click(editBtn);
    expect(mockOnEditChore).toHaveBeenCalledWith(sampleChore);
  });

  it('EditChoreModal pre-populates, updates chore data, and invokes onUpdateChore', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <EditChoreModal
        chore={sampleChore}
        onClose={mockOnClose}
        onUpdateChore={mockOnUpdateChore}
        onDeleteChore={mockOnDeleteChore}
      />
    );

    // Verify pre-populated values
    const titleInput = screen.getByLabelText(/chore title/i);
    expect(titleInput).toHaveValue('Clean Microwave');

    const descInput = screen.getByLabelText(/description/i);
    expect(descInput).toHaveValue('Wipe inside with lemon water');

    // Update title and effort points
    await user.clear(titleInput);
    await user.type(titleInput, 'Deep Steam Microwave');

    // Select 4 pts
    const fourPtsBtn = screen.getByRole('button', { name: /4 pts/i });
    await user.click(fourPtsBtn);

    // Select continuous duty
    const continuousBtn = screen.getByRole('button', { name: /continuous duty/i });
    await user.click(continuousBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveBtn);

    expect(mockOnUpdateChore).toHaveBeenCalledWith('c-1', {
      title: 'Deep Steam Microwave',
      description: 'Wipe inside with lemon water',
      effort_weight: 4,
      completion_type: 'continuous_duty',
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('EditChoreModal confirms and invokes onDeleteChore when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <EditChoreModal
        chore={sampleChore}
        onClose={mockOnClose}
        onUpdateChore={mockOnUpdateChore}
        onDeleteChore={mockOnDeleteChore}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /delete chore from ledger/i });
    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDeleteChore).toHaveBeenCalledWith('c-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('UpForGrabsPool allows editing and deleting chores from sticky notes', async () => {
    const user = userEvent.setup();
    const mockOnClaim = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const poolAssignment: ChoreAssignment = {
      id: 'a-unassigned',
      chore_id: 'c-1',
      member_id: null,
      week_start_date: '2026-08-24',
      status: 'pending',
      chore: sampleChore,
    };

    render(
      <UpForGrabsPool
        chores={[poolAssignment]}
        onClaimChore={mockOnClaim}
        onEditChore={mockOnEditChore}
        onDeleteChore={mockOnDeleteChore}
      />
    );

    // Click edit on memo note
    const editBtn = screen.getByRole('button', { name: /edit clean microwave/i });
    await user.click(editBtn);
    expect(mockOnEditChore).toHaveBeenCalledWith(sampleChore);

    // Click delete on memo note
    const deleteBtn = screen.getByRole('button', { name: /delete clean microwave/i });
    await user.click(deleteBtn);
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDeleteChore).toHaveBeenCalledWith('c-1');
  });
});
