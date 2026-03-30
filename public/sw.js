// Minimal Service Worker to satisfy PWA requirements
// and stop 404 errors during development.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    console.log('PWA: Minimal Service Worker active.');
});

self.addEventListener('fetch', (event) => {
    // Just a passthrough for development
    event.respondWith(fetch(event.request));
});
