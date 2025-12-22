const SCOPE_PATH = (() => {
  const scopeUrl = new URL(self.registration.scope);
  const path = scopeUrl.pathname.endsWith('/')
    ? scopeUrl.pathname.slice(0, -1)
    : scopeUrl.pathname;
  return path || '/';
})();

const BASE_PATH = SCOPE_PATH;
const BASE_WITH_SLASH = BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`;

const CACHE_VERSION = 'v3';
const CACHE_NAME = `art-region-responder-cache-${CACHE_VERSION}`;
const OFFLINE_URL = `${BASE_WITH_SLASH}offline.html`;

const PRECACHE_URLS = [
  BASE_PATH,
  BASE_WITH_SLASH,
  OFFLINE_URL,
  // Root-level fallbacks and manifests
  '/offline.html',
  '/manifest.json',
  '/site.webmanifest',
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
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            // Skip missing assets in dev to avoid install failure
            console.warn('[SW] precache skip', url, err);
          }
        }),
      );
    })(),
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

  // Only handle requests within our scoped path to avoid overlap with other apps
  const url = new URL(request.url);
  const inScope =
    url.pathname === BASE_PATH || url.pathname.startsWith(BASE_WITH_SLASH);
  if (!inScope) return;

  // Navigation: network-first, fallback to cache, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          // If the network returns 200, cache and use it; otherwise try cache/offline
          if (response.ok) {
            cacheResponse(request, response);
            return response.clone();
          }
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline || response;
        })
        .catch(async () =>
          (await caches.match(request)) || (await caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  // Same-origin GET under BASE_PATH: cache-first with network fill.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          cacheResponse(request, response);
          return response.clone();
        })
        .catch(() => caches.match(OFFLINE_URL));
    }),
  );
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
  const url = payload.url ?? `${BASE_PATH}/`;
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
