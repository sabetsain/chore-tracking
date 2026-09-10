import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplianceDashboard } from './ApplianceDashboard';
import { Appliance, ApplianceStateLog } from '../types';

describe('ApplianceDashboard Component', () => {
  const mockAppliances: Appliance[] = [
    {
      id: 'app-1',
      household_id: 'h-1',
      name: 'Kitchen Dishwasher',
      type: 'dishwasher',
      current_state: 'dirty',
      state_step_1: 'dirty',
      state_step_2: 'running',
      state_step_3: 'needs_attention',
      timer_enabled: false,
      state_updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
      updated_by_member: {
        id: 'm-1',
        household_id: 'h-1',
        nickname: 'Sam',
        role: 'member',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 'app-2',
      household_id: 'h-1',
      name: 'Main Washing Machine',
      type: 'washer',
      current_state: 'needs_attention',
      state_step_1: 'empty',
      state_step_2: 'running',
      state_step_3: 'needs_attention',
      timer_enabled: false,
      state_updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updated_by_member: {
        id: 'm-2',
        household_id: 'h-1',
        nickname: 'Alex',
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    },
  ];

  const mockLogs: ApplianceStateLog[] = [
    {
      id: 'log-1',
      appliance_id: 'app-1',
      from_state: 'empty',
      to_state: 'dirty',
      trigger_source: 'manual',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      actor_member: {
        id: 'm-1',
        household_id: 'h-1',
        nickname: 'Sam',
        role: 'member',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    },
  ];

  const mockOnUpdateState = vi.fn();
  const mockOnFetchHistory = vi.fn();
  const mockOnCreateAppliance = vi.fn();
  const mockOnUpdateAppliance = vi.fn();
  const mockOnResetAppliance = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders appliance cards with status badges and actor info', () => {
    render(
      <ApplianceDashboard
        appliances={mockAppliances}
        onUpdateState={mockOnUpdateState}
        onFetchHistory={mockOnFetchHistory}
        onCreateAppliance={mockOnCreateAppliance}
      />
    );

    expect(screen.getByText('Kitchen Dishwasher')).toBeInTheDocument();
    expect(screen.getByText('Main Washing Machine')).toBeInTheDocument();
    expect(screen.getByText(/dirty/i)).toBeInTheDocument();
    expect(screen.getByText(/needs attention/i)).toBeInTheDocument();
    expect(screen.getByText(/Sam/i)).toBeInTheDocument();
    expect(screen.getByText(/Alex/i)).toBeInTheDocument();
  });

  it('triggers 1-tap state transition when action button is clicked', async () => {
    const user = userEvent.setup();
    mockOnUpdateState.mockResolvedValueOnce(undefined);

    render(
      <ApplianceDashboard
        appliances={mockAppliances}
        onUpdateState={mockOnUpdateState}
        onFetchHistory={mockOnFetchHistory}
        onCreateAppliance={mockOnCreateAppliance}
      />
    );

    // Dirty dishwasher -> Next state is "running" (e.g. Start Cycle)
    const startCycleBtn = screen.getByRole('button', { name: /start cycle|running/i });
    await user.click(startCycleBtn);

    expect(mockOnUpdateState).toHaveBeenCalledWith('app-1', 'running');
  });

  it('opens history modal when History button is clicked', async () => {
    const user = userEvent.setup();
    mockOnFetchHistory.mockResolvedValueOnce(mockLogs);

    render(
      <ApplianceDashboard
        appliances={mockAppliances}
        onUpdateState={mockOnUpdateState}
        onFetchHistory={mockOnFetchHistory}
        onCreateAppliance={mockOnCreateAppliance}
      />
    );

    const historyBtns = screen.getAllByRole('button', { name: /history/i });
    await user.click(historyBtns[0]);

    expect(mockOnFetchHistory).toHaveBeenCalledWith('app-1');
    await waitFor(() => {
      expect(screen.getByText(/Activity History/i)).toBeInTheDocument();
      expect(screen.getByText(/empty → dirty/i)).toBeInTheDocument();
    });
  });

  it('opens guided add appliance modal and creates custom appliance', async () => {
    const user = userEvent.setup();
    mockOnCreateAppliance.mockResolvedValueOnce(undefined);

    render(
      <ApplianceDashboard
        appliances={mockAppliances}
        onUpdateState={mockOnUpdateState}
        onFetchHistory={mockOnFetchHistory}
        onCreateAppliance={mockOnCreateAppliance}
      />
    );

    const addBtn = screen.getByRole('button', { name: /add appliance/i });
    await user.click(addBtn);

    expect(screen.getByPlaceholderText(/appliance name/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/appliance name/i), 'Balcony Dryer');

    const submitBtn = screen.getByRole('button', { name: /save appliance|create/i });
    await user.click(submitBtn);

    expect(mockOnCreateAppliance).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Balcony Dryer',
      })
    );
  });

  it('opens edit modal from appliance card and updates appliance', async () => {
    const user = userEvent.setup();
    mockOnUpdateAppliance.mockResolvedValueOnce(undefined);

    render(
      <ApplianceDashboard
        appliances={mockAppliances}
        onUpdateState={mockOnUpdateState}
        onFetchHistory={mockOnFetchHistory}
        onCreateAppliance={mockOnCreateAppliance}
        onUpdateAppliance={mockOnUpdateAppliance}
        onResetAppliance={mockOnResetAppliance}
      />
    );

    const editBtns = screen.getAllByRole('button', { name: /edit appliance/i });
    await user.click(editBtns[0]);

    expect(screen.getByText(/Edit Appliance/i)).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText(/appliance name/i);
    expect(nameInput).toHaveValue('Kitchen Dishwasher');

    await user.clear(nameInput);
    await user.type(nameInput, 'Modern Kitchen Dishwasher');

    const updateBtn = screen.getByRole('button', { name: /update appliance/i });
    await user.click(updateBtn);

    expect(mockOnUpdateAppliance).toHaveBeenCalledWith(
      'app-1',
      expect.objectContaining({
        name: 'Modern Kitchen Dishwasher',
      })
    );
  });

  it('triggers reset action on an appliance', async () => {
    const user = userEvent.setup();
    mockOnResetAppliance.mockResolvedValueOnce(undefined);

    render(
      <ApplianceDashboard
        appliances={mockAppliances}
        onUpdateState={mockOnUpdateState}
        onFetchHistory={mockOnFetchHistory}
        onCreateAppliance={mockOnCreateAppliance}
        onUpdateAppliance={mockOnUpdateAppliance}
        onResetAppliance={mockOnResetAppliance}
      />
    );

    const resetBtns = screen.getAllByRole('button', { name: /abort \/ reset cycle/i });
    await user.click(resetBtns[0]);

    expect(mockOnResetAppliance).toHaveBeenCalledWith('app-1');
  });

  it('renders "Start Cycle" directly for empty appliances and "Mark Emptied" for clean dishwasher', async () => {
    const user = userEvent.setup();
    mockOnUpdateState.mockResolvedValue(undefined);

    const testAppliances: Appliance[] = [
      {
        id: 'washer-1',
        household_id: 'h-1',
        name: 'Main Washing Machine',
        type: 'washer',
        current_state: 'empty',
        state_step_1: 'empty',
        state_step_2: 'running',
        state_step_3: 'needs_attention',
        timer_enabled: false,
        state_updated_at: new Date().toISOString(),
      },
      {
        id: 'dryer-1',
        household_id: 'h-1',
        name: 'Main Clothes Dryer',
        type: 'dryer',
        current_state: 'empty',
        state_step_1: 'empty',
        state_step_2: 'running',
        state_step_3: 'needs_attention',
        timer_enabled: false,
        state_updated_at: new Date().toISOString(),
      },
      {
        id: 'dw-1',
        household_id: 'h-1',
        name: 'Kitchen Dishwasher',
        type: 'dishwasher',
        current_state: 'needs_attention',
        state_step_1: 'dirty',
        state_step_2: 'running',
        state_step_3: 'needs_attention',
        timer_enabled: false,
        state_updated_at: new Date().toISOString(),
      },
    ];

    render(
      <ApplianceDashboard
        appliances={testAppliances}
        onUpdateState={mockOnUpdateState}
        onFetchHistory={mockOnFetchHistory}
        onCreateAppliance={mockOnCreateAppliance}
      />
    );

    // Washer and Dryer: Button should say "Start Cycle"
    const startCycleBtns = screen.getAllByRole('button', { name: /start cycle/i });
    expect(startCycleBtns.length).toBe(2);

    // Click Washer "Start Cycle" -> calls onUpdateState with 'running'
    await user.click(startCycleBtns[0]);
    expect(mockOnUpdateState).toHaveBeenCalledWith('washer-1', 'running');

    // Dishwasher in needs_attention: Button should say "Mark Emptied" and transition to 'dirty'
    const markEmptiedBtn = screen.getByRole('button', { name: /mark emptied/i });
    await user.click(markEmptiedBtn);
    expect(mockOnUpdateState).toHaveBeenCalledWith('dw-1', 'dirty');
  });
});
