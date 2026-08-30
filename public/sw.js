// Service Worker for 多語系視覺 OCR 隨身翻譯官
// IMPORTANT: Bump this version string on every deploy to force cache refresh
const CACHE_NAME = 'ocr-translator-v2';

// Install: skip waiting immediately so new SW takes over
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: delete ALL old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - API calls: always network, offline fallback
// - Navigation (HTML): NETWORK FIRST — always try to get the latest from server
// - Static assets (JS/CSS/images): Stale-while-revalidate
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

  // Navigation requests (page loads): NETWORK FIRST
  // This prevents the blank screen issue after redeploys
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh HTML for offline use
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline: fall back to cached HTML
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // Static assets: Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
