// TypingMaster Game Service Worker
const CACHE_NAME = 'typing-master-v1';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/keyboard.png',
  '/bgmsc/typing.mp3',
  '/bgmsc/success.mp3',
  '/bgmsc/error.mp3'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('[ServiceWorker] Removing old cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );

  // Ensures that the service worker takes control of the page immediately
  self.clients.claim();
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For HTML requests - use a network-first strategy
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return cacheResponse(event.request, response);
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/');
          });
        })
    );
    return;
  }

  // For all other requests - use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          return cacheResponse(event.request, response);
        })
        .catch((error) => {
          console.error('[ServiceWorker] Fetch failed:', error);
          // If it's an image, you could return a default offline image
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            return caches.match('/images/keyboard.png');
          }
          throw error;
        });
    })
  );
});

// Helper function to cache responses
function cacheResponse(request, response) {
  // Clone the response as it can only be consumed once
  const responseToCache = response.clone();

  // Only cache valid responses
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return response;
  }

  caches.open(CACHE_NAME).then((cache) => {
    cache.put(request, responseToCache);
  });

  return response;
}
