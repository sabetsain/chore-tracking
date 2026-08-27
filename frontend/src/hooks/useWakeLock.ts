import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseWakeLockResult {
  isSupported: boolean;
  isActive: boolean;
  requestWakeLock: () => Promise<boolean>;
  releaseWakeLock: () => Promise<boolean>;
  toggleWakeLock: () => Promise<boolean>;
}

export function useWakeLock(): UseWakeLockResult {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [isActive, setIsActive] = useState<boolean>(false);
  const wakeLockRef = useRef<any>(null);
  const shouldBeActiveRef = useRef<boolean>(false);

  const requestWakeLock = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      wakeLockRef.current = lock;
      shouldBeActiveRef.current = true;
      setIsActive(true);

      lock.addEventListener?.('release', () => {
        wakeLockRef.current = null;
        if (!shouldBeActiveRef.current) {
          setIsActive(false);
        }
      });
      return true;
    } catch {
      setIsActive(false);
      shouldBeActiveRef.current = false;
      return false;
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async (): Promise<boolean> => {
    shouldBeActiveRef.current = false;
    if (wakeLockRef.current) {
      try {
        const res = wakeLockRef.current.release?.();
        if (res && typeof res.then === 'function') {
          await res;
        }
        wakeLockRef.current = null;
        setIsActive(false);
        return true;
      } catch {
        setIsActive(false);
        return false;
      }
    }
    setIsActive(false);
    return true;
  }, []);

  const toggleWakeLock = useCallback(async (): Promise<boolean> => {
    if (isActive) {
      return releaseWakeLock();
    } else {
      return requestWakeLock();
    }
  }, [isActive, requestWakeLock, releaseWakeLock]);

  // Re-acquire on visibilitychange if user desires kiosk mode
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldBeActiveRef.current && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        try {
          const res = wakeLockRef.current.release?.();
          if (res && typeof res.catch === 'function') {
            res.catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    };
  }, [isSupported, requestWakeLock]);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock,
  };
}

export default useWakeLock;
