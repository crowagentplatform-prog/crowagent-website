const CACHE_NAME = 'crowagent-v14';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.min.css?v=13',
  '/scripts.min.js?v=13',
  '/manifest.json',
  '/Assets/Branding Logo/favicon.png',
  '/Doc/privacy-policy-2026-03.pdf',
  '/Doc/terms-and-conditions-2026-03.pdf',
  '/legal.html',
  '/privacy.html',
  '/terms.html',
  '/cookies.html',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // For navigation requests, prefer network and fall back to cache (offline mode).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For assets, serve cache-first then network.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Refresh in background
        fetch(request).then(response => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
