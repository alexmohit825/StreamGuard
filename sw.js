const CACHE_NAME = 'streamguard-v2.0.0';
const ASSETS = [
  './',
  './index.html',
  './app.css?v=2.0.0',
  './app.js?v=2.0.0',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[StreamGuard SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Real-time ping and external diagnostic endpoints bypass cache completely
  if (
    url.includes('1.1.1.1') ||
    url.includes('8.8.8.8') ||
    url.includes('cloudflare-dns') ||
    url.includes('fastly') ||
    url.includes('akamai') ||
    url.includes('cdnjs') ||
    url.includes('httpbin') ||
    url.includes('speed')
  ) {
    return event.respondWith(fetch(event.request));
  }

  // Network-first strategy for navigation and HTML to ensure TV updates instantly
  if (event.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    return event.respondWith(
      fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match('./index.html'))
    );
  }

  // Stale-while-revalidate for local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
