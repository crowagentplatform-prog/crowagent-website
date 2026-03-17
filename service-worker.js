const CACHE_NAME = 'crowagent-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.min.css?v=6',
  '/scripts.min.js?v=6',
  '/manifest.json',
  '/Assets/Branding Logo/logo.png',
  '/Assets/Branding Logo/favicon.png',
  '/Assets/Product logo/Crowagentcore-128.png',
  '/Assets/Product logo/Crowsight-128.png',
  '/Assets/Product logo/Crowbuild-128.png',
  '/Assets/Product logo/CrowMark-128.png',
  '/Assets/Product logo/CrowTrace-128.png',
  '/Assets/Product logo/CrowNest-128.png',
  '/Doc/privacy-policy.pdf',
  '/Doc/terms-and-conditions.pdf',
  '/legal.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'
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
