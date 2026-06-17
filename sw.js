const CACHE_NAME = 'quiz-app-v21';
const ASSETS = [
  './',
  './index.html',
  './quiz.html',
  './result.html',
  './review.html',
  './css/style.css',
  './js/main.js',
  './js/quiz.js',
  './js/result.js',
  './js/review.js',
  './js/sw-register.js',
  './data/reasoning.json',
  './data/memory.json',
  './data/japanese.json',
  './data/english.json',
  './manifest.json',
  './icon.svg',
  './images/trajectory_001_q.svg',
  './images/trajectory_001_1.svg',
  './images/trajectory_001_2.svg',
  './images/trajectory_001_3.svg',
  './images/trajectory_001_4.svg',
  './images/trajectory_001_5.svg',
  './images/cube_001_q.svg',
  './images/cube_002_q.svg',
  './images/chart_001_q.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const url = new URL(event.request.url);
            const isSameOrigin = url.origin === self.location.origin;
            const isFontRequest =
              url.hostname.includes('fonts.googleapis.com') ||
              url.hostname.includes('fonts.gstatic.com');

            if (isSameOrigin || isFontRequest) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
          }
          return networkResponse;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
