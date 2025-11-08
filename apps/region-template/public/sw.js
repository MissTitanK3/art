const CACHE_NAME = 'art-region-template-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler to satisfy installability criteria
self.addEventListener('fetch', (_event) => {
  // No-op: allow default network handling
});

