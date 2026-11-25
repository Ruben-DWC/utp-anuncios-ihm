const CACHE_NAME = 'utp-anuncios-v3';
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/utp-logo-new-BPM18T9V.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // No cachear llamadas a funciones serverless ni APIs externas
  if (url.pathname.startsWith('/.netlify/') || url.origin !== self.location.origin) {
    return;
  }

  // Estrategia Network-First con fallback a caché para navegación y App Shell
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('/index.html').then(
              (r) => r || new Response('Offline', { status: 503, statusText: 'Offline' })
            );
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        })
      )
  );
});
