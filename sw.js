// 栄養スクリーニング一発判定 — Service Worker
// 版数は index.html の APP_VER と揃えること
const CACHE_NAME='nutrition-screening-v1.2.1';
const ASSETS=['./','./index.html','./icon-180.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k.startsWith('nutrition-screening-')&&k!==CACHE_NAME).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});
// キャッシュ優先＋裏で更新（オフラインでも起動できる）
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(
    caches.match(req,{ignoreSearch:true}).then(hit=>{
      const net=fetch(req).then(res=>{
        if(res&&res.ok){const cp=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,cp));}
        return res;
      }).catch(()=>hit);
      return hit||net;
    })
  );
});
