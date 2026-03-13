// sw.js (Service Worker para instalar como App)
const CACHE_NAME = 'earmage-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './js/data.js',
  './js/core.js',
  './js/combat.js',
  './js/render.js',
  './js/ui.js',
  './js/engine.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
