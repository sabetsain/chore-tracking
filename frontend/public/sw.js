// Household Coordination Service Worker
// Handles background push notifications and interactive notification action clicks

self.addEventListener('install', () => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Become active on open clients
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: 'Household Update',
        body: event.data.text(),
      };
    }
  }

  const title = payload.title || 'Household Update';
  const options = {
    body: payload.body || 'New activity in your household.',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    tag: payload.tag || 'household-notification',
    data: payload.data || { url: '/' },
    renotify: true,
    actions: payload.actions || (payload.data?.applianceId ? [
      { action: 'empty', title: 'Mark Emptied' },
      { action: 'open', title: 'Open Logbook' }
    ] : []),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // If action is to empty appliance directly from notification
  if (event.action === 'empty' || event.action === 'empty_appliance') {
    const applianceId = event.notification.data && event.notification.data.applianceId;
    if (applianceId) {
      event.waitUntil(
        fetch(`/api/v1/appliances/${applianceId}/state`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: 'empty' }),
        }).catch(() => {})
      );
      return;
    }
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
