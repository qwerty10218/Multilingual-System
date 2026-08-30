// Service Worker for 多語系視覺 OCR 隨身翻譯官
const CACHE_NAME = 'ocr-translator-v1';

// Assets to cache on install (app shell)
const SHELL_ASSETS = [
  '/',
  '/index.html',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network first for API, Cache first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always network for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ success: false, error: '目前離線，請連線後重試。' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Bypass cache for Vite dev server files
  if (url.pathname.includes('.tsx') || url.pathname.includes('.ts') || url.pathname.includes('@vite')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first, then network for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Only cache successful GET requests
        if (
          response.ok &&
          event.request.method === 'GET' &&
          !url.pathname.startsWith('/api/')
        ) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
