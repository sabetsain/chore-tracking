import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAppBadging } from './useAppBadging';

describe('useAppBadging', () => {
  let setBadgeMock: any;
  let clearBadgeMock: any;

  beforeEach(() => {
    setBadgeMock = vi.fn().mockResolvedValue(undefined);
    clearBadgeMock = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'setAppBadge', {
      writable: true,
      configurable: true,
      value: setBadgeMock,
    });

    Object.defineProperty(navigator, 'clearAppBadge', {
      writable: true,
      configurable: true,
      value: clearBadgeMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls setAppBadge when pendingCount > 0', () => {
    renderHook(() => useAppBadging(4));
    expect(setBadgeMock).toHaveBeenCalledWith(4);
    expect(clearBadgeMock).not.toHaveBeenCalled();
  });

  it('calls clearAppBadge when pendingCount is 0', () => {
    renderHook(() => useAppBadging(0));
    expect(clearBadgeMock).toHaveBeenCalled();
  });
});
