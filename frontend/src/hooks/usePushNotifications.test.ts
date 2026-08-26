import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePushNotifications } from './usePushNotifications';
import * as pushUtils from '../utils/pushNotifications';

describe('usePushNotifications hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with unsupported state when isPushSupported returns false', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(false);

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {});

    expect(result.current.isSupported).toBe(false);
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('checks and finds active subscription when supported', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'getPushSubscription').mockResolvedValue({
      endpoint: 'https://push.example.com/sub/123',
    } as any);

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {});

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('toggles subscription from unsubscribed to subscribed', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'getPushSubscription').mockResolvedValue(null);
    vi.spyOn(pushUtils, 'subscribeToPush').mockResolvedValue({
      endpoint: 'https://push.example.com/sub/new',
    } as any);

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {});
    expect(result.current.isSubscribed).toBe(false);

    await act(async () => {
      const res = await result.current.toggleSubscription();
      expect(res).toBe(true);
    });

    expect(result.current.isSubscribed).toBe(true);
    expect(pushUtils.subscribeToPush).toHaveBeenCalled();
  });

  it('toggles subscription from subscribed to unsubscribed', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'getPushSubscription').mockResolvedValue({
      endpoint: 'https://push.example.com/sub/123',
    } as any);
    vi.spyOn(pushUtils, 'unsubscribeFromPush').mockResolvedValue(true);

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {});
    expect(result.current.isSubscribed).toBe(true);

    await act(async () => {
      const res = await result.current.toggleSubscription();
      expect(res).toBe(false);
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(pushUtils.unsubscribeFromPush).toHaveBeenCalled();
  });
});
