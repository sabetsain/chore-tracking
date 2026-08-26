import { api } from '../api/client';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error('Failed to get push subscription:', err);
    return null;
  }
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const { public_key } = await api.getVapidPublicKey();
  if (!public_key) {
    throw new Error('VAPID public key not returned by backend');
  }

  const registration = await navigator.serviceWorker.ready;
  const applicationServerKey = urlBase64ToUint8Array(public_key);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
  });

  const subJson = subscription.toJSON();
  await api.subscribePush({
    endpoint: subscription.endpoint,
    keys: subJson.keys as { p256dh: string; auth: string },
  });

  return subscription;
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await api.unsubscribePush({ endpoint: subscription.endpoint });
    }
    return true;
  } catch (err) {
    console.error('Failed to unsubscribe from push:', err);
    return false;
  }
}
