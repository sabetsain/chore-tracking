import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsView } from './SettingsView';
import { Household, Member } from '../types';

describe('SettingsView Component', () => {
  const adminMember: Member = {
    id: 'm-1',
    household_id: 'h-1',
    nickname: 'Alex',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const regularMember: Member = {
    id: 'm-2',
    household_id: 'h-1',
    nickname: 'Sam',
    role: 'member',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const mockHousehold: Household = {
    id: 'h-1',
    name: 'Sunset Villa',
    invite_code: 'ABC123',
    timezone: 'America/New_York',
    created_at: new Date().toISOString(),
  };

  const mockOnRegenerateCode = vi.fn();
  const mockOnLogout = vi.fn();
  const mockOnToggleAway = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings details and allows admin to regenerate code', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockOnRegenerateCode.mockResolvedValueOnce('NEW789');

    render(
      <SettingsView
        household={mockHousehold}
        member={adminMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
      />
    );

    expect(screen.getByText('Sunset Villa')).toBeInTheDocument();
    expect(screen.getByText('America/New_York')).toBeInTheDocument();

    const regenBtn = screen.getByRole('button', { name: /regenerate code/i });
    await user.click(regenBtn);

    expect(mockOnRegenerateCode).toHaveBeenCalled();
  });

  it('hides regenerate code button for regular member', () => {
    render(
      <SettingsView
        household={mockHousehold}
        member={regularMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
      />
    );

    expect(screen.queryByRole('button', { name: /regenerate code/i })).not.toBeInTheDocument();
  });

  it('calls onLogout when Log Out button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <SettingsView
        household={mockHousehold}
        member={adminMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
      />
    );

    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    await user.click(logoutBtn);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('renders push notification section and allows toggling push notifications ON', async () => {
    const user = userEvent.setup();
    const mockOnSubscribe = vi.fn().mockResolvedValue(true);

    render(
      <SettingsView
        household={mockHousehold}
        member={adminMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
        pushEnabled={false}
        pushSupported={true}
        onTogglePush={mockOnSubscribe}
      />
    );

    expect(screen.getByRole('heading', { name: /push notifications/i })).toBeInTheDocument();
    expect(screen.getByText('Push Notifications Disabled')).toBeInTheDocument();
    const enableBtn = screen.getByRole('button', { name: /enable push/i });
    await user.click(enableBtn);

    expect(mockOnSubscribe).toHaveBeenCalled();
  });

  it('allows disabling push notifications when already enabled', async () => {
    const user = userEvent.setup();
    const mockOnTogglePush = vi.fn().mockResolvedValue(true);

    render(
      <SettingsView
        household={mockHousehold}
        member={adminMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
        pushEnabled={true}
        pushSupported={true}
        onTogglePush={mockOnTogglePush}
      />
    );

    expect(screen.getByText(/Active - Receiving Alerts/i)).toBeInTheDocument();
    const disableBtn = screen.getByRole('button', { name: /disable push/i });
    await user.click(disableBtn);

    expect(mockOnTogglePush).toHaveBeenCalled();
  });

  it('shows unsupported message when push notifications are not supported', () => {
    render(
      <SettingsView
        household={mockHousehold}
        member={adminMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
        pushSupported={false}
      />
    );

    expect(screen.getByText(/Not supported in this browser/i)).toBeInTheDocument();
  });

  it('shares invite code using navigator.share when supported', async () => {
    const user = userEvent.setup();
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      writable: true,
      configurable: true,
      value: shareMock,
    });

    render(
      <SettingsView
        household={mockHousehold}
        member={adminMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
      />
    );

    const shareBtn = screen.getByRole('button', { name: /share invite code/i });
    await user.click(shareBtn);

    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Sunset Villa'),
        text: expect.stringContaining('ABC123'),
      })
    );
  });

  it('renders Countertop Fridge Kiosk Mode section', () => {
    render(
      <SettingsView
        household={mockHousehold}
        member={adminMember}
        onRegenerateCode={mockOnRegenerateCode}
        onLogout={mockOnLogout}
        onToggleAway={mockOnToggleAway}
      />
    );

    expect(screen.getByText('Countertop Fridge Kiosk Mode')).toBeInTheDocument();
  });
});
