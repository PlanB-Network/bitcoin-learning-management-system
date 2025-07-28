self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (_event) => {
  clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });
