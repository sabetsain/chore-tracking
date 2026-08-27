import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from './useWakeLock';

describe('useWakeLock', () => {
  let mockLock: any;
  let requestMock: any;

  beforeEach(() => {
    mockLock = {
      released: false,
      release: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    requestMock = vi.fn().mockResolvedValue(mockLock);

    Object.defineProperty(navigator, 'wakeLock', {
      writable: true,
      configurable: true,
      value: {
        request: requestMock,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports isSupported=true when navigator.wakeLock is available', () => {
    const { result } = renderHook(() => useWakeLock());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isActive).toBe(false);
  });

  it('requests screen wake lock on requestWakeLock', async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      const success = await result.current.requestWakeLock();
      expect(success).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledWith('screen');
    expect(result.current.isActive).toBe(true);
  });

  it('releases screen wake lock on releaseWakeLock', async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.requestWakeLock();
    });
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      const success = await result.current.releaseWakeLock();
      expect(success).toBe(true);
    });

    expect(mockLock.release).toHaveBeenCalled();
    expect(result.current.isActive).toBe(false);
  });

  it('toggles wake lock state', async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.toggleWakeLock();
    });
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      await result.current.toggleWakeLock();
    });
    expect(result.current.isActive).toBe(false);
  });
});
