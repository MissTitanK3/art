/// <reference lib="webworker" />

import { defaultCache, PAGES_CACHE_NAME } from '@serwist/next/worker';
import { Serwist } from 'serwist';
import { cleanupOutdatedCaches } from 'serwist/internal';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<{ url: string; revision?: string }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  runtimeCaching: defaultCache,
  skipWaiting: true,
  clientsClaim: true,
  cacheId: 'region-responder-v1.0.005',
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

cleanupOutdatedCaches();
serwist.addEventListeners();

const PREWARM_ROUTES = ['/', '/intake', '/region-response', '/offline.html'];

const cacheTarget = async (target: string) => {
  const url = new URL(target, self.location.origin);
  const isData = url.pathname.startsWith('/_next/data/');
  const cacheName = isData ? 'next-data' : PAGES_CACHE_NAME.html;
  const cache = await caches.open(cacheName);
  const request = new Request(url.toString(), { credentials: 'include' });
  const existing = await cache.match(request, {
    ignoreSearch: !isData,
  });
  if (existing) return;

  try {
    const res = await fetch(request, { cache: 'no-store' });
    if (res.ok) {
      await cache.put(request, res.clone());
    }
  } catch {
    // If offline, seed with app shell so the route can still resolve.
    try {
      const shell = (await cache.match('/', { ignoreSearch: true })) || (await caches.match('/'));
      if (shell) {
        await cache.put(request, shell.clone());
      }
    } catch {
      // Ignore seeding failures.
    }
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const htmlCache = await caches.open(PAGES_CACHE_NAME.html);
      await Promise.all(
        PREWARM_ROUTES.map(async (path) => {
          try {
            const res = await fetch(path, { cache: 'no-store' });
            if (res && res.ok) {
              await htmlCache.put(path, res.clone());
            }
          } catch {
            // Ignore failures; best-effort warmup.
          }
        }),
      );
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Navigation/network-first with HTML cache + offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const htmlCache = await caches.open(PAGES_CACHE_NAME.html);
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            htmlCache.put(request, fresh.clone()).catch(() => undefined);
          }
          return fresh;
        } catch {
          const cached =
            (await htmlCache.match(request, { ignoreSearch: true })) ||
            (await htmlCache.match(url.pathname, { ignoreSearch: true })) ||
            (await htmlCache.match('/'));
          if (cached) return cached;
          const offline = await caches.match('/offline.html');
          if (offline) return offline;
          return Response.error();
        }
      })(),
    );
    return;
  }

  // Treat HTML document prefetches similarly.
  const accept = request.headers.get('accept') || '';
  const isHtmlDoc = accept.includes('text/html') && url.origin === self.location.origin && request.mode === 'cors';
  if (isHtmlDoc) {
    event.respondWith(
      (async () => {
        const htmlCache = await caches.open(PAGES_CACHE_NAME.html);
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            htmlCache.put(request, fresh.clone()).catch(() => undefined);
          }
          return fresh;
        } catch {
          const cached =
            (await htmlCache.match(request, { ignoreSearch: true })) ||
            (await htmlCache.match(url.pathname, { ignoreSearch: true })) ||
            (await htmlCache.match('/'));
          if (cached) return cached;
          const offline = await caches.match('/offline.html');
          if (offline) return offline;
          return Response.error();
        }
      })(),
    );
    return;
  }

  const isRsc =
    request.headers.get('RSC') === '1' && url.origin === self.location.origin && !url.pathname.startsWith('/api/');

  if (!isRsc) return;

  event.respondWith(
    (async () => {
      const rscCache = await caches.open(PAGES_CACHE_NAME.rsc);
      const htmlCache = await caches.open(PAGES_CACHE_NAME.html);
      // Cache key must be GET or the cache API will reject; RSC requests can be POST.
      const cacheKey = new Request(url.pathname, { method: 'GET' });

      const cached = await rscCache.match(cacheKey, { ignoreSearch: true });
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          try {
            await rscCache.put(cacheKey, fresh.clone());
          } catch {
            // Ignore cache write failures (e.g., opaque or quota).
          }
          return fresh;
        }
      } catch {
        // Ignore network errors and try fallbacks.
      }

      if (cached) return cached;
      const html = await htmlCache.match(url.pathname, { ignoreSearch: true });
      if (html) return html;

      const offline = await caches.match('/offline.html');
      if (offline) return offline;
      return new Response('Offline', { status: 503 });
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'CACHE_ROUTE') return;

  const targets = [data.path, data.dataPath].filter(Boolean);
  if (!targets.length) return;

  event.waitUntil(Promise.all(targets.map(cacheTarget)));
});
