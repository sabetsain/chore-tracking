import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplianceCard } from './ApplianceCard';
import { Appliance } from '../types';
import { soundEngine } from '../utils/soundEngine';

vi.mock('../utils/soundEngine', () => ({
  soundEngine: {
    playStampSound: vi.fn(),
    playChimeSound: vi.fn(),
    playPencilScribbleSound: vi.fn(),
    playPageFlipSound: vi.fn(),
  },
}));

describe('ApplianceCard Component', () => {
  const mockOnUpdateState = vi.fn();
  const mockOnViewHistory = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseAppliance: Appliance = {
    id: 'app-washer-1',
    household_id: 'h-1',
    name: 'Smart Laundry Washer',
    type: 'washer',
    icon: 'washing machine',
    current_state: 'empty',
    state_step_1: 'empty',
    state_step_2: 'running',
    state_step_3: 'needs_attention',
    timer_enabled: true,
    default_timer_minutes: 45,
    state_updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updated_by_member: {
      id: 'm-1',
      household_id: 'h-1',
      nickname: 'Alex',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
    },
  };

  it('renders appliance name, icon type, rubber stamp, and actor', () => {
    render(
      <ApplianceCard
        appliance={baseAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
        onEdit={mockOnEdit}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Smart Laundry Washer')).toBeInTheDocument();
    expect(screen.getByText(/washing machine/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('READY TO RUN!');
    expect(screen.getByText(/Alex/i)).toBeInTheDocument();
  });

  it('opens duration picker dialog when starting cycle with timer_enabled=true', async () => {
    const user = userEvent.setup();

    render(
      <ApplianceCard
        appliance={baseAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
        onEdit={mockOnEdit}
        onReset={mockOnReset}
      />
    );

    const startBtn = screen.getByRole('button', { name: /start cycle/i });
    await user.click(startBtn);

    // Duration picker dialog should appear
    expect(screen.getByText(/Set Cycle Duration/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '15m' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30m' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '45m' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60m' })).toBeInTheDocument();

    // Select 30m preset and click Start Cycle inside dialog
    const chip30 = screen.getByRole('button', { name: '30m' });
    await user.click(chip30);

    const dialogStartBtn = screen.getAllByRole('button', { name: /start cycle/i })[1];
    await user.click(dialogStartBtn);

    expect(mockOnUpdateState).toHaveBeenCalledWith('app-washer-1', 'running', 30);
  });

  it('accepts custom duration input in duration picker', async () => {
    const user = userEvent.setup();

    render(
      <ApplianceCard
        appliance={baseAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
        onEdit={mockOnEdit}
        onReset={mockOnReset}
      />
    );

    await user.click(screen.getByRole('button', { name: /start cycle/i }));

    const customInput = screen.getByPlaceholderText(/e\.g\. 50/i);
    await user.type(customInput, '25');

    const dialogStartBtn = screen.getAllByRole('button', { name: /start cycle/i })[1];
    await user.click(dialogStartBtn);

    expect(mockOnUpdateState).toHaveBeenCalledWith('app-washer-1', 'running', 25);
  });

  it('transitions directly without picker when timer_enabled=false', async () => {
    const user = userEvent.setup();
    const noTimerAppliance: Appliance = {
      ...baseAppliance,
      timer_enabled: false,
    };

    render(
      <ApplianceCard
        appliance={noTimerAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    await user.click(screen.getByRole('button', { name: /start cycle/i }));
    expect(mockOnUpdateState).toHaveBeenCalledWith('app-washer-1', 'running');
    expect(screen.queryByText(/Set Cycle Duration/i)).not.toBeInTheDocument();
  });

  it('renders live countdown when running with active timer', () => {
    const runningAppliance: Appliance = {
      ...baseAppliance,
      current_state: 'running',
      timer_ends_at: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20m remaining
    };

    render(
      <ApplianceCard
        appliance={runningAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    expect(screen.getAllByText(/remaining/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/20m remaining|19m remaining/i).length).toBeGreaterThan(0);

    const actionBtn = screen.getByRole('button', { name: /running/i });
    expect(actionBtn).toBeDisabled();
  });

  it('shows AWAITING CONFIRMATION badge and enables confirmation button when timer finishes', async () => {
    const user = userEvent.setup();
    const finishedAppliance: Appliance = {
      ...baseAppliance,
      current_state: 'running',
      timer_ends_at: new Date(Date.now() - 60 * 1000).toISOString(), // Finished 1 min ago
    };

    render(
      <ApplianceCard
        appliance={finishedAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    // Should render AWAITING CONFIRMATION
    expect(screen.getByText('AWAITING CONFIRMATION')).toBeInTheDocument();
    expect(screen.getByText(/Timer complete \(00:00\) — Confirmation needed/i)).toBeInTheDocument();
    expect(soundEngine.playChimeSound).toHaveBeenCalled();

    // Confirm button should be enabled
    const confirmBtn = screen.getByRole('button', { name: /confirm & mark done/i });
    expect(confirmBtn).not.toBeDisabled();

    await user.click(confirmBtn);
    expect(mockOnUpdateState).toHaveBeenCalledWith('app-washer-1', 'needs_attention');
  });

  it('triggers Abort / Reset Cycle action', async () => {
    const user = userEvent.setup();
    render(
      <ApplianceCard
        appliance={baseAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
        onReset={mockOnReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /abort \/ reset cycle/i });
    await user.click(resetBtn);

    expect(mockOnReset).toHaveBeenCalledWith('app-washer-1');
  });

  it('triggers onEdit callback when edit icon is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApplianceCard
        appliance={baseAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
        onEdit={mockOnEdit}
      />
    );

    const editBtn = screen.getByRole('button', { name: /edit appliance/i });
    await user.click(editBtn);

    expect(mockOnEdit).toHaveBeenCalledWith(baseAppliance);
  });
});
