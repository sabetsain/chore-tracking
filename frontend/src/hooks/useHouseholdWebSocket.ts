import { useEffect, useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { WebSocketEvent } from '../types';

interface UseHouseholdWebSocketOptions {
  householdId?: string | null;
  token?: string | null;
  queryClient: QueryClient;
  onHouseholdChanged?: () => void;
}

export function useHouseholdWebSocket({
  householdId,
  token,
  queryClient,
  onHouseholdChanged,
}: UseHouseholdWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onHouseholdChangedRef = useRef(onHouseholdChanged);
  onHouseholdChangedRef.current = onHouseholdChanged;

  useEffect(() => {
    if (!householdId || !token) {
      return;
    }

    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/ws/${householdId}?token=${encodeURIComponent(token)}`;

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        // Connected
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as WebSocketEvent;
          switch (payload.event) {
            case 'APPLIANCE_STATE_CHANGED':
              queryClient.invalidateQueries({ queryKey: ['appliances'] });
              break;

            case 'CHORE_UPDATED':
              queryClient.invalidateQueries({ queryKey: ['chores'] });
              break;

            case 'CHORE_ROTATION_CHANGED':
              queryClient.invalidateQueries({ queryKey: ['chores'] });
              queryClient.invalidateQueries({ queryKey: ['members'] });
              if (onHouseholdChangedRef.current) {
                onHouseholdChangedRef.current();
              }
              break;

            case 'MEMBER_STATUS_CHANGED':
              queryClient.invalidateQueries({ queryKey: ['members'] });
              queryClient.invalidateQueries({ queryKey: ['chores'] });
              break;

            default:
              break;
          }
        } catch {
          // ignore non-json payload
        }
      };

      socket.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [householdId, token, queryClient]);

  return wsRef;
}
