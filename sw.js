// Pamięć podręczna: aplikacja działa offline, a raz obejrzane mapy są dostępne bez internetu.
const APP='tld-app-v1',IMG='tld-maps-v1';
const SHELL=['./','index.html','assets/app.css','assets/app.js','assets/data.js','assets/sketch.js','data/maps.json','data/maps-fallback.js','manifest.webmanifest','icons/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![APP,IMG].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.hostname.endsWith('steamusercontent.com')){ // mapy: najpierw z pamięci
    e.respondWith(caches.open(IMG).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;
      const r=await fetch(e.request);if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r}));
    return;
  }
  if(u.origin===location.origin){ // aplikacja: z sieci, a bez sieci z pamięci
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cl=r.clone();caches.open(APP).then(c=>c.put(e.request,cl))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
  }
});
