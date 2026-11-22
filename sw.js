/* Service worker — app shell cached for offline use. Change VERSION on every release. */
const VERSION='3.57-pwa';
const CACHE='hi-stock-'+VERSION;
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))));
  /* no skipWaiting here: the page asks the user first, so nothing reloads in the middle of data entry */
});
self.addEventListener('message',e=>{ if(e.data==='skipWaiting') self.skipWaiting(); });
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hi-stock-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;                                   /* Sheets sync (POST) goes straight to the network */
  const u=new URL(r.url);
  if(u.origin!==self.location.origin) return;
  if(r.mode==='navigate'){
    e.respondWith(caches.open(CACHE).then(c=>c.match('index.html')).then(m=>m||fetch(r)));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r)));
});
