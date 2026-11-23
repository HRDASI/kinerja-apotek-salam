const C = 'kinerja-2.1';
const FILES = ['./', 'index.html', 'img/logo.png', 'img/ikon-180.png', 'img/ikon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // server tidak di-cache
  const ambil = fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
    return r;
  });
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(ada => {
    if (ada) { e.waitUntil(ambil.catch(() => {})); return ada; }
    return ambil.catch(() => caches.match('index.html'));
  }));
});