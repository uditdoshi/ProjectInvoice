const CACHE = 'easyinvoice-final-phone-fix-1';
const ASSETS = [
  './', './index.html', './assets/style.css', './assets/app.js',
  './assets/database.js', './config.js', './data/data.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/company-logo.png'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(c => c.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
