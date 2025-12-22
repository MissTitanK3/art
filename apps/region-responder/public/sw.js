const CACHE_VERSION = 'v2';
const CACHE_NAME = `art-region-responder-cache-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon-192.png',
  '/maskable-icon-512.png',
  '/site.webmanifest',
];

const cacheResponse = async (request, response) => {
  if (!response || !(response.ok || response.type === 'opaque')) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) =>
          name.startsWith('art-region-responder-cache-') && name !== CACHE_NAME
            ? caches.delete(name)
            : Promise.resolve(),
        ),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const { request } = event;

  // Navigation: prefer network, fall back to cache, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cacheResponse(request, response);
          return response.clone();
        })
        .catch(async () =>
          (await caches.match(request)) || (await caches.match('/offline.html')),
        ),
    );
    return;
  }

  const url = new URL(request.url);
  // Same-origin GET: cache-first with network fill.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            cacheResponse(request, response);
            return response.clone();
          })
          .catch(() => caches.match('/offline.html'));
      }),
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data?.json?.() ?? {};
  } catch {
    payload = {};
  }
  const title = payload.title ?? 'Dispatch Update';
  const body = payload.body ?? '';
  const url = payload.url ?? '/';
  const icon = payload.icon ?? '/icon-192.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      badge: '/badge.png',
      icon,
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url;
  if (!url) return;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client && client.url === url) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
        return undefined;
      }),
  );
});
