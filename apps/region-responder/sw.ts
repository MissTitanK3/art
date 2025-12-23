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
  cacheId: 'region-responder-v1.0.001',
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();

self.addEventListener('activate', () => {
  cleanupOutdatedCaches();
});

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
    // Ignore caching failures (likely offline).
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isRsc =
    request.headers.get('RSC') === '1' && url.origin === self.location.origin && !url.pathname.startsWith('/api/');

  if (!isRsc) return;

  event.respondWith(
    (async () => {
      const rscCache = await caches.open(PAGES_CACHE_NAME.rsc);
      const htmlCache = await caches.open(PAGES_CACHE_NAME.html);

      const cached = await rscCache.match(request, { ignoreSearch: true });
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          await rscCache.put(request, fresh.clone());
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
      return Response.error();
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
