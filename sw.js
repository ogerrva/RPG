self.addEventListener('install', (e) => {
    console.log('[Service Worker] Instalado');
});

self.addEventListener('fetch', (e) => {
    // Apenas passa a requisição adiante (necessário para o PWA ser validado)
    e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
