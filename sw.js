const CACHE = 'famous-atipik-v3';
const SHELL = ['./', 'index.html', 'style.css', 'script.js', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // Photos : cache d'abord, rafraîchies en arrière-plan, page et styles : réseau d'abord
  if (r.destination === 'image') {
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; }).catch(() => hit);
      return hit || net;   // affichage immédiat depuis le cache, mise à jour en arrière-plan
    }));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res;
  }).catch(() => caches.match(r)));
});
