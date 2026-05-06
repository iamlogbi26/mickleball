const CACHE_NAME = "mickleball-force-v2";

self.addEventListener("install", e => {
  self.skipWaiting(); // FORCE the update
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key))); // DELETE ALL OLD CACHE
    })
  );
});

self.addEventListener("fetch", e => {
  // Always go to the internet first to get the newest code
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
