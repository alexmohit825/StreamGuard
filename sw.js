const CACHE_NAME = 'streamguard-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Allow network bypass for real-time live ping & diagnostic endpoints
  if (
    event.request.url.includes('1.1.1.1') ||
    event.request.url.includes('8.8.8.8') ||
    event.request.url.includes('cloudflare-dns') ||
    event.request.url.includes('fastly') ||
    event.request.url.includes('akamai') ||
    event.request.url.includes('httpbin') ||
    event.request.url.includes('speed')
  ) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => caches.match('./index.html'))
  );
});
