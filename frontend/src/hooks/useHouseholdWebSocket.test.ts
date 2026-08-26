import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { useHouseholdWebSocket } from './useHouseholdWebSocket';

class MockWebSocket {
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  readyState: number = 0; // CONNECTING

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.onopen?.();
    }, 10);
  }

  close() {
    this.readyState = 3; // CLOSED
    this.onclose?.();
  }

  send(_data: string) {}

  static instances: MockWebSocket[] = [];
}

describe('useHouseholdWebSocket hook', () => {
  let queryClient: QueryClient;
  let originalWebSocket: any;

  beforeEach(() => {
    MockWebSocket.instances = [];
    originalWebSocket = (global as any).WebSocket;
    (global as any).WebSocket = MockWebSocket;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.spyOn(queryClient, 'invalidateQueries');
  });

  afterEach(() => {
    (global as any).WebSocket = originalWebSocket;
    vi.restoreAllMocks();
  });

  it('connects to WebSocket endpoint with household_id and token', () => {
    renderHook(() =>
      useHouseholdWebSocket({
        householdId: 'h-100',
        token: 'jwt-token-123',
        queryClient,
      })
    );

    expect(MockWebSocket.instances.length).toBe(1);
    expect(MockWebSocket.instances[0].url).toContain('/api/v1/ws/h-100?token=jwt-token-123');
  });

  it('invalidates appliance queries on APPLIANCE_STATE_CHANGED', async () => {
    renderHook(() =>
      useHouseholdWebSocket({
        householdId: 'h-100',
        token: 'jwt-token-123',
        queryClient,
      })
    );

    const ws = MockWebSocket.instances[0];

    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          event: 'APPLIANCE_STATE_CHANGED',
          data: { id: 'app-1', current_state: 'running' },
        }),
      });
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['appliances'],
    });
  });

  it('invalidates chore queries on CHORE_UPDATED', async () => {
    renderHook(() =>
      useHouseholdWebSocket({
        householdId: 'h-100',
        token: 'jwt-token-123',
        queryClient,
      })
    );

    const ws = MockWebSocket.instances[0];

    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          event: 'CHORE_UPDATED',
          data: { action: 'completed' },
        }),
      });
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['chores'],
    });
  });

  it('invalidates member and chore queries on MEMBER_STATUS_CHANGED', async () => {
    renderHook(() =>
      useHouseholdWebSocket({
        householdId: 'h-100',
        token: 'jwt-token-123',
        queryClient,
      })
    );

    const ws = MockWebSocket.instances[0];

    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          event: 'MEMBER_STATUS_CHANGED',
          data: { id: 'm-1', status: 'away' },
        }),
      });
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['members'],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['chores'],
    });
  });
});
