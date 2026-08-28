import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { api, getStoredToken, setStoredToken } from '../api/client';
import React from 'react';

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>();
  return {
    ...actual,
    api: {
      getMe: vi.fn(),
      login: vi.fn(),
      joinHousehold: vi.fn(),
      createHousehold: vi.fn(),
      updateMyStatus: vi.fn(),
    },
  };
});

describe('AuthContext', () => {
  const mockHousehold = {
    id: 'h-1',
    name: 'Dream House',
    invite_code: 'CODE12',
    timezone: 'America/New_York',
    chore_rotation_active: false,
    created_at: new Date().toISOString(),
  };

  const mockMember = {
    id: 'm-1',
    household_id: 'h-1',
    nickname: 'Taylor',
    role: 'admin' as const,
    status: 'active' as const,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes as unauthenticated when no token is present', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.member).toBeNull();
    expect(result.current.household).toBeNull();
  });

  it('restores session when valid token exists', async () => {
    setStoredToken('test-token');
    vi.mocked(api.getMe).mockResolvedValueOnce({
      ...mockMember,
      household: mockHousehold,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.member?.nickname).toBe('Taylor');
    expect(result.current.household?.name).toBe('Dream House');
  });

  it('logs out and clears token on logout', async () => {
    setStoredToken('test-token');
    vi.mocked(api.getMe).mockResolvedValueOnce({
      ...mockMember,
      household: mockHousehold,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(getStoredToken()).toBeNull();
  });
});
