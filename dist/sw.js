const CACHE='hero-academy-moneyquest-v4';
const FILES=['./','./index.html','./style.css','./app.js','./academy-client.js','./academy-client.css','./content.js','./engine.js','./art.js','./hero-art.js','./minigames.js','./sync.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hero-academy-moneyquest-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type!=='opaque'){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}return r;}).catch(async()=>await caches.match(e.request)||(e.request.mode==='navigate'?await caches.match('./index.html'):Response.error())));
});
