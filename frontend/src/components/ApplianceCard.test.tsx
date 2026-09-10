import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplianceCard } from './ApplianceCard';
import { Appliance } from '../types';
import { soundEffects } from '../utils/soundEffects';

vi.mock('../utils/soundEffects', () => ({
  soundEffects: {
    playWoodClick: vi.fn(),
    getMuted: vi.fn().mockReturnValue(false),
    setMuted: vi.fn(),
    toggleMuted: vi.fn(),
  },
}));

describe('ApplianceCard Component', () => {
  const mockAppliance: Appliance = {
    id: 'app-1',
    household_id: 'h-1',
    name: 'Kitchen Dishwasher',
    type: 'dishwasher',
    current_state: 'dirty',
    state_updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_by_member: {
      id: 'm-1',
      household_id: 'h-1',
      nickname: 'Sam',
      role: 'member',
      status: 'active',
      created_at: new Date().toISOString(),
    },
  };

  const mockOnUpdateState = vi.fn();
  const mockOnViewHistory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders StatusStamp with current state and preserves state text', () => {
    render(
      <ApplianceCard
        appliance={mockAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    // StatusStamp has role="status" and text DIRTY
    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveTextContent(/dirty/i);
  });

  it('renders actor IdentitySticker in audit trail alongside nickname', () => {
    render(
      <ApplianceCard
        appliance={mockAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    // IdentitySticker has role="img" with Sam's sticker
    const sticker = screen.getByRole('img', { name: /Sam's sticker/i });
    expect(sticker).toBeInTheDocument();
    expect(screen.getByText(/by/i)).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
  });

  it('renders system/sensor fallback when updated_by_member is missing', () => {
    const applianceWithoutActor: Appliance = {
      ...mockAppliance,
      updated_by_member: undefined,
    };

    render(
      <ApplianceCard
        appliance={applianceWithoutActor}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    expect(screen.getByText(/System\/Sensor/i)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /sticker/i })).not.toBeInTheDocument();
  });

  it('renders full-width 4-state action button with explicit action verb "Start Cycle"', async () => {
    const user = userEvent.setup();
    mockOnUpdateState.mockResolvedValueOnce(undefined);

    render(
      <ApplianceCard
        appliance={mockAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    const actionBtn = screen.getByRole('button', { name: /Start Cycle/i });
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn.className).toContain('w-full');
    expect(actionBtn.className).toContain('min-h-[46px]');
    expect(actionBtn.className).toMatch(/(bg-accent-slate|bg-accent-terracotta)/);

    await user.click(actionBtn);

    expect(mockOnUpdateState).toHaveBeenCalledWith('app-1', 'running');
    expect(soundEffects.playWoodClick).toHaveBeenCalled();
  });

  it('renders "Mark Clean" for running appliance with sage accent', () => {
    const runningAppliance: Appliance = {
      ...mockAppliance,
      current_state: 'running',
    };

    render(
      <ApplianceCard
        appliance={runningAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    const actionBtn = screen.getByRole('button', { name: /Mark Clean/i });
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn.className).toContain('bg-accent-sage');
  });

  it('renders "Mark Emptied" for clean_needs_emptying appliance with slate accent', () => {
    const cleanAppliance: Appliance = {
      ...mockAppliance,
      current_state: 'clean_needs_emptying',
    };

    render(
      <ApplianceCard
        appliance={cleanAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    const actionBtn = screen.getByRole('button', { name: /Mark Emptied/i });
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn.className).toContain('bg-accent-slate');
  });

  it('calls onViewHistory when History button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ApplianceCard
        appliance={mockAppliance}
        onUpdateState={mockOnUpdateState}
        onViewHistory={mockOnViewHistory}
      />
    );

    const historyBtn = screen.getByRole('button', { name: /history/i });
    await user.click(historyBtn);

    expect(mockOnViewHistory).toHaveBeenCalledWith(mockAppliance);
  });
});
