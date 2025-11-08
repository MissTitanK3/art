const CACHE_NAME = 'art-watch-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (_event) => {
  // Minimal handler; keep default network
});

