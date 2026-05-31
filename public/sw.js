/**
 * ReadHubs Service Worker
 * Enables offline reading via caching of opened books
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `readhubs-static-${CACHE_VERSION}`;
const BOOKS_CACHE = `readhubs-books-${CACHE_VERSION}`;
const API_CACHE = `readhubs-data-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
];

const BOOKS_DATA_PATTERNS = [
  /\/books\/index\.json$/,
  /\/books\/[^/]+\/meta\.json$/,
];

const BOOK_CONTENT_PATTERNS = [
  /\/books\/[^/]+\/content\.html$/,
  /\/books\/[^/]+\/cover\.webp$/,
  /\/books\/[^/]+\/articles\/article-\d+\.json$/,
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== BOOKS_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  const path = url.pathname;

  // Book content (content.html, cover.webp, articles) — cache-first (offline reading)
  if (BOOK_CONTENT_PATTERNS.some((p) => p.test(path))) {
    event.respondWith(cacheFirst(request, BOOKS_CACHE));
    return;
  }

  // Books data JSON — stale-while-revalidate
  if (BOOKS_DATA_PATTERNS.some((p) => p.test(path))) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // JS/CSS assets — cache-first
  if (path.match(/\.(js|css|woff2?|ttf)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Images — cache-first
  if (path.match(/\.(png|jpg|jpeg|webp|svg|ico)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML/navigation — network-first with fallback
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

// ─── STRATEGIES ───────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const indexCached = await cache.match('/');
    if (indexCached) return indexCached;
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => {});
  return cached || fetchPromise;
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
// <!-- MONETAG_PUSH_NOTIFICATION -->
// Replace this section with Monetag push notification subscription code

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'ReadHubs', {
      body: data.body || 'New books added!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
