const CACHE_NAME = 'twisting-slash-v1';
const assets = [
  '/',
  'index.html',
  'style.css',
  'game.js',
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap'
];

// Instalação: Salva arquivos no cache
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets...');
      cache.addAll(assets);
    })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Busca: Serve arquivos do cache se estiver offline
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});
