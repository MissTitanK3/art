const CACHE_VERSION = '2025-12-22.1';
const CACHE_NAME = `art-region-responder-cache-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/',
  '/intake',
  '/intake/',
  '/region-response',
  '/region-response/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon-192.png',
  '/maskable-icon-512.png',
];
const STATIC_ASSETS = PRECACHE_URLS;

// Allow the app to request caching of dynamic routes and their data payloads.
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'CACHE_ROUTE') return;

  const targets = [data.path, data.dataPath].filter(Boolean);
  if (!targets.length) return;

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const target of targets) {
        try {
          const res = await fetch(target, { cache: 'no-store' });
          if (res && res.ok) {
            await cache.put(target, res.clone());
          }
        } catch (err) {
          console.log('CACHE_ROUTE fetch failed', target, err);
        }
      }
    })()
  );
});

const cacheResponse = async (request, response) => {
  if (!response || !(response.ok || response.type === 'opaque')) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);

      // Alias favicon to an existing icon so offline browsers don't error on /favicon.ico.
      const icon = await cache.match('/icon-192.png');
      if (icon) {
        await cache.put('/favicon.ico', icon.clone());
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => (name === CACHE_NAME ? null : caches.delete(name)))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const { request } = event;
  const url = new URL(request.url);

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

  // Cache-first for static assets and build outputs.
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/_next/data/') ||
      url.pathname.startsWith('/icon-') ||
      url.pathname.startsWith('/maskable-icon-') ||
      STATIC_ASSETS.includes(url.pathname));

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const fresh = await fetch(request);
          if (fresh && fresh.status === 200) {
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch (err) {
          // Avoid returning HTML for JS/CSS; give an empty 503 so the failure is explicit.
          return new Response('', { status: 503 });
          console.log('Fetch failed for static asset; returning empty response instead.', err);
        }
      })()
    );
    return;
  }

  // Default: network-first with offline fallback.
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((res) => res || caches.match('/offline.html')))
  );
});
