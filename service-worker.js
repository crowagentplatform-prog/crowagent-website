const CACHE_NAME = 'crowagent-v49';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.min.css?v=49',
  '/scripts.min.js?v=49',
  '/manifest.json',
  '/favicon.ico',
  '/print.css',
  '/pricing',
  '/products/crowagent-core',
  '/products/crowmark',
  '/csrd',
  '/blog',
  '/about',
  '/demo',
  '/contact',
  '/roadmap',
  '/security',
  '/faq',
  '/partners',
  '/privacy',
  '/terms',
  '/cookies',
  '/blog/ppn-002-guide',
  '/blog/mees-band-c-2028',
  '/blog/csrd-omnibus-i-2026',
  '/blog/mees-commercial-property-guide',
  '/blog/ppn-002-social-value-guide',
  '/blog/retrofit-cost-calculator-guide',
  '/blog/epc-register-explained',
  '/blog/social-value-themes-explained',
  '/blog/mees-exemptions-guide',
  '/blog/regulatory-updates-2026',
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
