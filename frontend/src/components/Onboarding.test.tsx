import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Onboarding } from './Onboarding';

describe('Onboarding Component', () => {
  const mockOnLogin = vi.fn();
  const mockOnJoin = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Join House tab by default and submits join form', async () => {
    const user = userEvent.setup();
    mockOnJoin.mockResolvedValueOnce(undefined);

    render(
      <Onboarding
        onLogin={mockOnLogin}
        onJoin={mockOnJoin}
        onCreate={mockOnCreate}
      />
    );

    expect(screen.getByRole('tab', { name: /join/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/6-letter code/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/6-letter code/i), 'ABC123');
    await user.type(screen.getByPlaceholderText(/your nickname/i), 'Jordan');
    await user.type(screen.getByPlaceholderText(/4-digit pin/i), '1234');

    await user.click(screen.getByRole('button', { name: /join household/i }));

    expect(mockOnJoin).toHaveBeenCalledWith({
      invite_code: 'ABC123',
      nickname: 'Jordan',
      pin: '1234',
    });
  });

  it('switches to Create House tab and submits creation form', async () => {
    const user = userEvent.setup();
    mockOnCreate.mockResolvedValueOnce(undefined);

    render(
      <Onboarding
        onLogin={mockOnLogin}
        onJoin={mockOnJoin}
        onCreate={mockOnCreate}
      />
    );

    await user.click(screen.getByRole('tab', { name: /create/i }));

    expect(screen.getByPlaceholderText(/house or apartment name/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/house or apartment name/i), 'Maple Grove');
    await user.type(screen.getByPlaceholderText(/your nickname/i), 'Morgan');
    await user.type(screen.getByPlaceholderText(/4-digit pin/i), '5678');

    await user.click(screen.getByRole('button', { name: /create household/i }));

    expect(mockOnCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Maple Grove',
        nickname: 'Morgan',
        pin: '5678',
      })
    );
  });

  it('switches to Login tab and submits login form', async () => {
    const user = userEvent.setup();
    mockOnLogin.mockResolvedValueOnce(undefined);

    render(
      <Onboarding
        onLogin={mockOnLogin}
        onJoin={mockOnJoin}
        onCreate={mockOnCreate}
      />
    );

    await user.click(screen.getByRole('tab', { name: /log in/i }));

    expect(screen.getByPlaceholderText(/your nickname/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/your nickname/i), 'Jordan');
    await user.type(screen.getByPlaceholderText(/4-digit pin/i), '1234');
    await user.type(screen.getByPlaceholderText(/6-letter code/i), 'ABC123');

    await user.click(screen.getByRole('button', { name: /log in to household/i }));

    expect(mockOnLogin).toHaveBeenCalledWith({
      nickname: 'Jordan',
      pin: '1234',
      invite_code: 'ABC123',
    });
  });

  it('displays error message when join fails', async () => {
    const user = userEvent.setup();
    mockOnJoin.mockRejectedValueOnce(new Error('Invalid invite code'));

    render(
      <Onboarding
        onLogin={mockOnLogin}
        onJoin={mockOnJoin}
        onCreate={mockOnCreate}
      />
    );

    await user.type(screen.getByPlaceholderText(/6-letter code/i), 'BAD123');
    await user.type(screen.getByPlaceholderText(/your nickname/i), 'Jordan');
    await user.click(screen.getByRole('button', { name: /join household/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid invite code/i)).toBeInTheDocument();
    });
  });
});
