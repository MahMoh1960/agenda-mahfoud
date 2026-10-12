const CACHE = 'mahfoud-agenda-v3';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('index.html'))));
});
self.addEventListener('notificationclick', e => {
  const data = e.notification.data || {};
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const msg = { id: data.id, action: e.action || 'open' };
    if (list.length) { list[0].postMessage(msg); if (!e.action) return list[0].focus(); return; }
    if (e.action) return; /* appli fermée : l'action sera ignorée, la tâche reste visible */
    return self.clients.openWindow('./');
  }));
});
