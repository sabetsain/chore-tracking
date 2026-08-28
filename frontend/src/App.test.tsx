import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './App';
import { api, setStoredToken } from './api/client';

vi.mock('./api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/client')>();
  return {
    ...actual,
    api: {
      getMe: vi.fn(),
      login: vi.fn(),
      joinHousehold: vi.fn(),
      createHousehold: vi.fn(),
      updateMyStatus: vi.fn(),
      regenerateInviteCode: vi.fn(),
      listAppliances: vi.fn(),
      createAppliance: vi.fn(),
      updateApplianceState: vi.fn(),
      getApplianceHistory: vi.fn(),
      listAssignments: vi.fn(),
      listUpForGrabs: vi.fn(),
      claimChore: vi.fn(),
      completeChore: vi.fn(),
      logChoreDuty: vi.fn(),
      swapChores: vi.fn(),
      listChores: vi.fn(),
    },
  };
});

describe('App Integration', () => {
  const mockHousehold = {
    id: 'h-100',
    name: 'Pine Creek House',
    invite_code: 'PCK123',
    timezone: 'UTC',
    chore_rotation_active: false,
    created_at: new Date().toISOString(),
  };

  const mockMember = {
    id: 'm-100',
    household_id: 'h-100',
    nickname: 'Robin',
    role: 'admin' as const,
    status: 'active' as const,
    created_at: new Date().toISOString(),
  };

  const mockAppliances = [
    {
      id: 'app-1',
      household_id: 'h-100',
      name: 'Kitchen Dishwasher',
      type: 'dishwasher' as const,
      current_state: 'empty' as const,
      state_updated_at: new Date().toISOString(),
      updated_by_member: mockMember,
    },
  ];

  const mockAssignments = [
    {
      id: 'asg-1',
      chore_id: 'ch-1',
      member_id: 'm-100',
      week_start_date: '2026-08-24',
      status: 'pending' as const,
      chore: {
        id: 'ch-1',
        household_id: 'h-100',
        title: 'Clean Kitchen Counters',
        effort_weight: 1,
        completion_type: 'single_weekly' as const,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      member: mockMember,
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders onboarding when unauthenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Household Coordination')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /join/i })).toBeInTheDocument();
    });
  });

  it('renders main application and navigates tabs when authenticated', async () => {
    setStoredToken('valid-token');
    vi.mocked(api.getMe).mockResolvedValueOnce({
      ...mockMember,
      household: mockHousehold,
    });
    vi.mocked(api.listAppliances).mockResolvedValue(mockAppliances);
    vi.mocked(api.listAssignments).mockResolvedValue(mockAssignments);
    vi.mocked(api.listUpForGrabs).mockResolvedValue([]);

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pine Creek House')).toBeInTheDocument();
      expect(screen.getByText('Kitchen Dishwasher')).toBeInTheDocument();
    });

    // Navigate to Chores tab
    await user.click(screen.getByRole('tab', { name: /chores/i }));
    await waitFor(() => {
      expect(screen.getByText('Clean Kitchen Counters')).toBeInTheDocument();
    });

    // Navigate to Settings tab
    await user.click(screen.getByRole('tab', { name: /settings/i }));
    await waitFor(() => {
      expect(screen.getByText('Household Settings')).toBeInTheDocument();
    });
  });
});
