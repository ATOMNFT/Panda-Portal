
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('panda-cache-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './app.js',
        './logo.png',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      }).catch(() => {
        return new Response("Offline. Please connect to the internet to fetch data.");
      })
    );
  }
});
