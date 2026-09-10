import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChoreDutyView } from './ChoreDutyView';
import { ChoreAssignment, Member } from '../types';
import { soundEffects } from '../utils/soundEffects';

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
    const { soundEffects } = await import('../utils/soundEffects');
    const woodClickSpy = vi.spyOn(soundEffects, 'playWoodClick');
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
    expect(markDoneBtn.className).toContain('min-h-[44px]');
    expect(markDoneBtn.className).toContain('bg-accent-sage');
    await user.click(markDoneBtn);

    expect(mockOnCompleteChore).toHaveBeenCalledWith('a-1');
    expect(woodClickSpy).toHaveBeenCalled();
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

  it('opens Add Chore modal and successfully creates a new chore', async () => {
    const user = userEvent.setup();
    const mockOnCreateChore = vi.fn().mockResolvedValueOnce(undefined);

    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onOpenSwap={mockOnOpenSwap}
        onCreateChore={mockOnCreateChore}
      />
    );

    const addChoreBtn = screen.getByRole('button', { name: /add chore/i });
    expect(addChoreBtn).toBeInTheDocument();
    await user.click(addChoreBtn);

    expect(screen.getByRole('heading', { name: /add new chore/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/chore title/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/chore title/i), 'Water Houseplants');
    await user.type(screen.getByLabelText(/description/i), 'Water ferns and succulents');

    // Choose 3 points
    const threePtsBtn = screen.getByRole('button', { name: /3 pts/i });
    await user.click(threePtsBtn);

    // Choose Continuous Duty
    const continuousBtn = screen.getByRole('button', { name: /continuous duty/i });
    await user.click(continuousBtn);

    const saveBtn = screen.getByRole('button', { name: /save chore/i });
    await user.click(saveBtn);

    expect(mockOnCreateChore).toHaveBeenCalledWith({
      title: 'Water Houseplants',
      description: 'Water ferns and succulents',
      effort_weight: 3,
      completion_type: 'continuous_duty',
    });
  });

  it('unchecks a completed chore and triggers onUncompleteChore', async () => {
    const user = userEvent.setup();
    const mockOnUncompleteChore = vi.fn().mockResolvedValueOnce(undefined);

    const completedAssignments: ChoreAssignment[] = [
      {
        ...mockAssignments[0],
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
    ];

    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={completedAssignments}
        onCompleteChore={mockOnCompleteChore}
        onUncompleteChore={mockOnUncompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
      />
    );

    // Should find the completed chore checkbox
    const checkbox = screen.getByRole('checkbox', { name: /Deep Clean Bathroom/i });
    expect(checkbox).toBeChecked();

    // Clicking the checked checkbox unchecks it and triggers onUncompleteChore
    await user.click(checkbox);
    expect(mockOnUncompleteChore).toHaveBeenCalledWith('a-1');
  });

  it('renders disabled / read-only checkboxes for roommates duties', async () => {
    const user = userEvent.setup();

    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
      />
    );

    // Sam's duty (Vacuum Common Areas)
    const samCheckbox = screen.getByRole('checkbox', { name: /Vacuum Common Areas/i });
    expect(samCheckbox).toBeDisabled();

    await user.click(samCheckbox);
    expect(mockOnCompleteChore).not.toHaveBeenCalled();
  });

  it('triggers onReassignChore when reassigning a chore via the dropdown', async () => {
    const user = userEvent.setup();
    const mockOnReassignChore = vi.fn().mockResolvedValueOnce(undefined);

    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onReassignChore={mockOnReassignChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        allMembers={[currentMember, otherMember]}
      />
    );

    // Find the reassignment select for Alex's chore
    const reassignSelect = screen.getByRole('combobox', { name: /Reassign Deep Clean Bathroom/i });
    expect(reassignSelect).toBeInTheDocument();
    expect(reassignSelect).toHaveValue('m-1');

    // Change value to Sam (m-2)
    await user.selectOptions(reassignSelect, 'm-2');

    expect(mockOnReassignChore).toHaveBeenCalledWith('a-1', 'm-2');
  });

  it('renders paused rotation banner when chore_rotation_active is false and activates on button click', async () => {
    const user = userEvent.setup();
    const mockOnActivateRotation = vi.fn().mockResolvedValueOnce(undefined);

    const mockHousehold = {
      id: 'h-1',
      name: 'Test House',
      invite_code: 'TEST12',
      timezone: 'UTC',
      chore_rotation_active: false,
      created_at: new Date().toISOString(),
    };

    render(
      <ChoreDutyView
        currentMember={currentMember}
        household={mockHousehold}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onActivateRotation={mockOnActivateRotation}
      />
    );

    expect(
      screen.getAllByText(/Chore rotation is currently paused\. Chores are available in the Up-for-Grabs pool\./i)[0]
    ).toBeInTheDocument();

    const activateBtn = screen.getByRole('button', {
      name: /distribute into buckets & start rotation/i,
    });
    expect(activateBtn).toBeInTheDocument();

    await user.click(activateBtn);
    expect(mockOnActivateRotation).toHaveBeenCalled();
  });

  it('renders active rotation controls when chore_rotation_active is true', async () => {
    const user = userEvent.setup();
    const mockOnReshuffleRotation = vi.fn().mockResolvedValueOnce(undefined);
    const mockOnDeactivateRotation = vi.fn().mockResolvedValueOnce(undefined);

    const mockHousehold = {
      id: 'h-1',
      name: 'Test House',
      invite_code: 'TEST12',
      timezone: 'UTC',
      chore_rotation_active: true,
      created_at: new Date().toISOString(),
    };

    render(
      <ChoreDutyView
        currentMember={currentMember}
        household={mockHousehold}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
        onReshuffleRotation={mockOnReshuffleRotation}
        onDeactivateRotation={mockOnDeactivateRotation}
      />
    );

    // Controls in top header
    const reshuffleBtn = screen.getByRole('button', { name: /re-shuffle buckets/i });
    const pauseBtn = screen.getByRole('button', { name: /pause rotation/i });

    expect(reshuffleBtn).toBeInTheDocument();
    expect(pauseBtn).toBeInTheDocument();

    await user.click(reshuffleBtn);
    expect(mockOnReshuffleRotation).toHaveBeenCalled();

    await user.click(pauseBtn);
    expect(mockOnDeactivateRotation).toHaveBeenCalled();
  });

  it('renders IdentitySticker avatars for current member and roommates', () => {
    render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
      />
    );

    // Alex's sticker for My Duties
    const alexStickers = screen.getAllByRole('img', { name: /Alex's sticker/i });
    expect(alexStickers.length).toBeGreaterThanOrEqual(1);

    // Sam's sticker for Sam's Duties
    const samStickers = screen.getAllByRole('img', { name: /Sam's sticker/i });
    expect(samStickers.length).toBeGreaterThanOrEqual(1);
  });

  it('plays wood click sound effect on complete and uncomplete', async () => {
    const user = userEvent.setup();
    const woodClickSpy = vi.spyOn(soundEffects, 'playWoodClick');
    mockOnCompleteChore.mockResolvedValueOnce(undefined);
    const mockOnUncompleteChore = vi.fn().mockResolvedValueOnce(undefined);

    const { rerender } = render(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={mockAssignments}
        onCompleteChore={mockOnCompleteChore}
        onUncompleteChore={mockOnUncompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
      />
    );

    const markDoneBtn = screen.getByRole('button', { name: /mark done/i });
    await user.click(markDoneBtn);

    expect(woodClickSpy).toHaveBeenCalledTimes(1);

    // Rerender with completed status
    const completedAssignments: ChoreAssignment[] = [
      {
        ...mockAssignments[0],
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
    ];

    rerender(
      <ChoreDutyView
        currentMember={currentMember}
        assignments={completedAssignments}
        onCompleteChore={mockOnCompleteChore}
        onUncompleteChore={mockOnUncompleteChore}
        onLogDuty={mockOnLogDuty}
        onToggleAway={mockOnToggleAway}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /Deep Clean Bathroom/i });
    await user.click(checkbox);

    expect(woodClickSpy).toHaveBeenCalledTimes(2);
    woodClickSpy.mockRestore();
  });
});


