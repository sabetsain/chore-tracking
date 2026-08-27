import { useEffect } from 'react';

export function useAppBadging(pendingCount: number): { isSupported: boolean } {
  const isSupported = typeof navigator !== 'undefined' && 'setAppBadge' in navigator;

  useEffect(() => {
    if (!isSupported) return;

    try {
      if (pendingCount > 0) {
        (navigator as any).setAppBadge?.(pendingCount).catch?.(() => {});
      } else {
        (navigator as any).clearAppBadge?.().catch?.(() => {});
      }
    } catch {
      // Gracefully ignore badging errors
    }
  }, [pendingCount, isSupported]);

  return { isSupported };
}

export default useAppBadging;
