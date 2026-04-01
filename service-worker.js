const CACHE_NAME = 'crowagent-v18';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css?v=18',
  '/scripts.js?v=18',
  '/resources.html',
  '/print.css',
  '/manifest.json',
  '/favicon.ico',
  '/legal.html',
  '/privacy.html',
  '/terms.html',
  '/cookies.html',
  '/pricing',
  '/demo',
  '/contact',
  '/about',
  '/security',
  '/roadmap',
  '/partners',
  '/products/crowagent-core',
  '/products/crowmark',
  '/blog/ppn-002-guide',
  '/blog/mees-band-c-2028',
  '/blog/csrd-omnibus-i-2026',
  '/blog/mees-commercial-property-guide.html',
  '/blog/ppn-002-social-value-guide.html',
  '/blog/retrofit-cost-calculator-guide.html',
  '/Assets/og-image.png',
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
        if (response && response.ok) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
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
            var bgClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, bgClone));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          var netClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, netClone));
        }
        return networkResponse;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
