// public/sw.js
const CACHE_NAME = 'rafiq-sayarati-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // إجبار المتصفح على تفعيل الـ SW الجديد فوراً
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // مسح الكاش القديم
          }
        })
      );
    }).then(() => self.clients.claim()) // السيطرة على الصفحات المفتوحة فوراً
  );
});

// استراتيجية الشبكة أولاً (Network First) لضمان جلب أحدث كود
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
