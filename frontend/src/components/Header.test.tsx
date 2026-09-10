import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from './Header';
import { Member, Household } from '../types';

describe('Header Component', () => {
  const mockHousehold: Household = {
    id: 'h-123',
    name: 'Sunset Villa',
    invite_code: 'ABC123',
    timezone: 'UTC',
    chore_rotation_active: false,
    created_at: new Date().toISOString(),
  };

  const mockActiveMember: Member = {
    id: 'm-1',
    household_id: 'h-123',
    nickname: 'Alex',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const mockAwayMember: Member = {
    ...mockActiveMember,
    nickname: 'Sam',
    status: 'away',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders household name, member nickname, and navigation tabs', () => {
    const onTabChange = vi.fn();
    render(
      <Header
        household={mockHousehold}
        member={mockActiveMember}
        activeTab="appliances"
        onTabChange={onTabChange}
      />
    );

    expect(screen.getByText('Sunset Villa')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /appliances/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /chores/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
    expect(screen.queryByText(/away/i)).not.toBeInTheDocument();
  });

  it('displays away indicator when member status is away', () => {
    render(
      <Header
        household={mockHousehold}
        member={mockAwayMember}
        activeTab="chores"
        onTabChange={vi.fn()}
      />
    );

    expect(screen.getByText('Sam')).toBeInTheDocument();
    expect(screen.getByText(/away/i)).toBeInTheDocument();
  });

  it('calls onTabChange when navigation tabs are clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <Header
        household={mockHousehold}
        member={mockActiveMember}
        activeTab="appliances"
        onTabChange={onTabChange}
      />
    );

    await user.click(screen.getByRole('tab', { name: /chores/i }));
    expect(onTabChange).toHaveBeenCalledWith('chores');

    await user.click(screen.getByRole('tab', { name: /settings/i }));
    expect(onTabChange).toHaveBeenCalledWith('settings');
  });

  it('copies invite code to clipboard when invite code button is clicked', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(
      <Header
        household={mockHousehold}
        member={mockActiveMember}
        activeTab="appliances"
        onTabChange={vi.fn()}
      />
    );

    const inviteBtn = screen.getByRole('button', { name: /ABC123|invite/i });
    await user.click(inviteBtn);

    expect(writeTextMock).toHaveBeenCalledWith('ABC123');
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it('renders audio mute toggle button and toggles sound mute state on click', async () => {
    const user = userEvent.setup();
    const { soundEffects } = await import('../utils/soundEffects');
    const { soundEngine } = await import('../utils/soundEngine');
    vi.spyOn(soundEffects, 'getMuted').mockReturnValue(false);
    const toggleSpy = vi.spyOn(soundEffects, 'toggleMuted').mockReturnValue(true);
    const soundEngineSpy = vi.spyOn(soundEngine, 'setEnabled');

    render(
      <Header
        household={mockHousehold}
        member={mockActiveMember}
        activeTab="appliances"
        onTabChange={vi.fn()}
      />
    );

    const muteBtn = screen.getByRole('button', { name: /mute audio feedback/i });
    expect(muteBtn).toBeInTheDocument();

    await user.click(muteBtn);

    expect(toggleSpy).toHaveBeenCalled();
    expect(soundEngineSpy).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: /unmute audio feedback/i })).toBeInTheDocument();
  });

  it('does not render SpiralSpine component', () => {
    const { container } = render(
      <Header
        household={mockHousehold}
        member={mockActiveMember}
        activeTab="appliances"
        onTabChange={vi.fn()}
      />
    );

    // No spiral coils or spiral spines
    expect(container.querySelector('[aria-label="Spiral binding"]')).toBeNull();
    expect(container.querySelector('svg[data-testid="spiral-loop"]')).toBeNull();
  });
});

