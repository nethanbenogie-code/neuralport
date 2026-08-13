const CACHE_NAME = 'chat-ui-cache-v1';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for the app shell; network-first (with cache fallback) for everything else
// (e.g. calls to local Ollama/LM Studio/Anthropic are same-origin-agnostic fetches and
// simply pass through — only GET requests to shell files are cached).
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isShellFile = APP_SHELL.some((f) => url.pathname.endsWith(f.replace('./', '')));

  if (isShellFile) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
  // Non-shell requests (API calls to Ollama/LM Studio/Anthropic) go straight to network.
});
