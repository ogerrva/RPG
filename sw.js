const CACHE_NAME = 'ear-mage-v1';
const ASSETS = [
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

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
