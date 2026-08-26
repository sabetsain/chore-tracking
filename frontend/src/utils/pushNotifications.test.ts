import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  urlBase64ToUint8Array,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from './pushNotifications';
import { api } from '../api/client';

describe('pushNotifications Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('urlBase64ToUint8Array', () => {
    it('correctly converts base64 URL safe string to Uint8Array', () => {
      const base64 = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      const array = urlBase64ToUint8Array(base64);
      expect(array).toBeInstanceOf(Uint8Array);
      expect(array.length).toBeGreaterThan(0);
    });
  });

  describe('isPushSupported', () => {
    it('returns true when serviceWorker, PushManager, and Notification exist', () => {
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'default', requestPermission: vi.fn() },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(window, 'PushManager', {
        value: function () {},
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { ready: Promise.resolve({}) },
        configurable: true,
        writable: true,
      });

      expect(isPushSupported()).toBe(true);
    });

    it('returns false when Notification is missing', () => {
      const originalNotification = (window as any).Notification;
      delete (window as any).Notification;

      expect(isPushSupported()).toBe(false);

      (window as any).Notification = originalNotification;
    });
  });

  describe('subscribeToPush', () => {
    it('requests permission, subscribes via pushManager, and registers with backend', async () => {
      const mockRawSubscription = {
        endpoint: 'https://push.example.com/sub/123',
        toJSON: () => ({
          endpoint: 'https://push.example.com/sub/123',
          keys: {
            p256dh: 'p256dh-key-content',
            auth: 'auth-key-content',
          },
        }),
      };

      const mockSubscribe = vi.fn().mockResolvedValue(mockRawSubscription);
      const mockSwRegistration = {
        pushManager: {
          subscribe: mockSubscribe,
          getSubscription: vi.fn().mockResolvedValue(null),
        },
      };

      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: vi.fn().mockResolvedValue('granted'),
        },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(window, 'PushManager', {
        value: function () {},
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(mockSwRegistration),
        },
        configurable: true,
        writable: true,
      });

      vi.spyOn(api, 'getVapidPublicKey').mockResolvedValue({
        public_key: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
      });
      vi.spyOn(api, 'subscribePush').mockResolvedValue({} as any);

      const result = await subscribeToPush();

      expect(window.Notification.requestPermission).toHaveBeenCalled();
      expect(api.getVapidPublicKey).toHaveBeenCalled();
      expect(mockSubscribe).toHaveBeenCalled();
      expect(api.subscribePush).toHaveBeenCalledWith({
        endpoint: 'https://push.example.com/sub/123',
        keys: {
          p256dh: 'p256dh-key-content',
          auth: 'auth-key-content',
        },
      });
      expect(result).toBe(mockRawSubscription);
    });

    it('returns null if notification permission is denied', async () => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'denied',
          requestPermission: vi.fn().mockResolvedValue('denied'),
        },
        configurable: true,
        writable: true,
      });

      const result = await subscribeToPush();
      expect(result).toBeNull();
    });
  });

  describe('unsubscribeFromPush', () => {
    it('unsubscribes from pushManager and removes record from backend', async () => {
      const mockUnsubscribe = vi.fn().mockResolvedValue(true);
      const mockSubscription = {
        endpoint: 'https://push.example.com/sub/123',
        unsubscribe: mockUnsubscribe,
      };

      const mockSwRegistration = {
        pushManager: {
          getSubscription: vi.fn().mockResolvedValue(mockSubscription),
        },
      };

      Object.defineProperty(window, 'Notification', {
        value: { permission: 'granted' },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(window, 'PushManager', {
        value: function () {},
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(mockSwRegistration),
        },
        configurable: true,
        writable: true,
      });

      vi.spyOn(api, 'unsubscribePush').mockResolvedValue(undefined as any);

      const success = await unsubscribeFromPush();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(api.unsubscribePush).toHaveBeenCalledWith({ endpoint: 'https://push.example.com/sub/123' });
      expect(success).toBe(true);
    });
  });
});
