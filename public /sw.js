// ✅ اسم الكاش - يجب تغييره عند تحديث التطبيق (v1, v2...)
const CACHE_NAME = 'rafiq-sayarati-v1';

// ✅ استخدام مسارات نسبية (Relative Paths) للعمل على GitHub Pages
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// =========================================================
// 1. حدث التثبيت (Install)
// =========================================================
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll تفشل بالكامل إذا فشل ملف واحد، نستخدم Promise.allSettled
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});

// =========================================================
// 2. حدث التنشيط (Activate)
// =========================================================
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// =========================================================
// 3. حدث الجلب (Fetch) - محمي ضد الكاش الخارجي
// =========================================================
self.addEventListener('fetch', (e) => {
  const request = e.request;

  // تجاهل الطلبات غير GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // ✅ إصلاح أمني: لا تخزن الطلبات الخارجية (Overpass API، إلخ)
  if (url.origin !== self.location.origin) {
    return; // يمررها المتصفح للشبكة مباشرة
  }

  // ✅ إصلاح منطقي: صفحة Fallback فقط للتنقل (navigate)
  e.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // تحديث الكاش في الخلفية (Stale-While-Revalidate)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // جلب من الشبكة
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // ✅ fallback فقط عند فشل التنقل بين الصفحات
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// =========================================================
// 4. الاستماع للإشعارات (Push)
// =========================================================
self.addEventListener('push', function(event) {
  let data = { title: 'رفيق سيارتي', body: 'لديك تنبيه جديد', url: './' };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icon-192x192.png',
    badge: './icon-192x192.png',
    data: { url: data.url },
    dir: 'rtl'
  };

  // ✅ إضافة vibrate بأمان (قد يفشل في iOS)
  try {
    options.vibrate = [200, 100, 200];
  } catch { /* ignore */ }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// =========================================================
// 5. النقر على الإشعار
// =========================================================
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // ✅ استخدام الرابط الممرر أو الصفحة الرئيسية
  const urlToOpen = new URL(
    event.notification.data?.url || './',
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. البحث عن نافذة مفتوحة على نفس النطاق
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (client.navigate) {
            return client.navigate(urlToOpen);
          }
          return client;
        }
      }
      // 2. فتح نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
