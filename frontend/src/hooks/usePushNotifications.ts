import { useEffect, useState, useCallback } from 'react';
import {
  isPushSupported,
  getPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from '../utils/pushNotifications';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    const supported = isPushSupported();
    setIsSupported(supported);
    if (!supported) {
      setIsLoading(false);
      return;
    }

    try {
      const sub = await getPushSubscription();
      setIsSubscribed(!!sub);
    } catch (err: any) {
      setError(err.message || 'Error checking push subscription');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const toggleSubscription = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);
    setError(null);
    try {
      if (isSubscribed) {
        const ok = await unsubscribeFromPush();
        if (ok) {
          setIsSubscribed(false);
          return false;
        }
      } else {
        const sub = await subscribeToPush();
        if (sub) {
          setIsSubscribed(true);
          return true;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update push subscription');
    } finally {
      setIsLoading(false);
    }
    return isSubscribed;
  }, [isSupported, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    toggleSubscription,
    checkSubscription,
  };
}
