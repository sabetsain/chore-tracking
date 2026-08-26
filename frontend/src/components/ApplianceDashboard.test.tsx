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
      current_state: 'clean_needs_emptying',
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
    expect(screen.getByText(/clean \/ needs emptying/i)).toBeInTheDocument();
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

  it('opens add appliance modal and creates appliance', async () => {
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
});
