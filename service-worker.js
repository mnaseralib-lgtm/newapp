
const CACHE_NAME = 'attendance-app-v1';
const OFFLINE_URL = 'index.html';
const STATIC_FILES = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_FILES);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); }));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // try network first for Google Script posts
  if (event.request.method === 'POST') {
    return;
  }
  event.respondWith((async () => {
    try {
      const networkResponse = await fetch(event.request);
      return networkResponse;
    } catch (err) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      return cached || (await cache.match(OFFLINE_URL));
    }
  })());
});
