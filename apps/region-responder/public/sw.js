const CACHE_VERSION = 'v2';
const CACHE_NAME = `art-region-responder-cache-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/',
  '/intake',
  '/intake/',
  '/region-response',
  '/region-response/',
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

  // Serve favicon from cache (aliased to icon-192) to avoid network errors offline.
  if (url.pathname === '/favicon.ico') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('/favicon.ico');
        if (cached) return cached;

        try {
          const res = await fetch('/icon-192.png');
          if (res && res.ok) {
            cache.put('/favicon.ico', res.clone());
            return res;
          }
        } catch (err) {
          console.log('Fetch failed for favicon; returning empty response instead.', err);
          // Ignore fetch errors; fall through to empty response.
        }

        return new Response('', { status: 204, headers: { 'Content-Type': 'image/x-icon' } });
      })()
    );
    return;
  }

  // Offline-first for navigations: serve cached page if offline, update cache when online.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        try {
          const fresh = await fetch(request, { cache: 'no-store' });
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          if (cached) return cached;
          console.log('Fetch failed; returning offline page instead.', err);

          // Fallback to app shell so client-side routing can handle navigation offline.
          const shell = await cache.match('/');
          if (shell) return shell;

          return cache.match('/offline.html');
        }
      })()
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
