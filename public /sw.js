// اسم الكاش (يجب تغييره عند تحديث التطبيق لإجبار المتصفح على تحميل النسخة الجديدة)
const CACHE_NAME = 'rafiq-sayarati-v1';

// قائمة الملفات الأساسية التي سيتم حفظها للعمل بدون إنترنت
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
  // ملاحظة: Vite يقوم تلقائياً بتخزين ملفات JS و CSS عند أول زيارة
];

// 1. حدث التثبيت (Install) - حفظ الملفات الأساسية
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. حدث التنشيط (Activate) - تنظيف الكاش القديم
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

// 3. حدث الجلب (Fetch) - ✅ الميزة المفقودة: العمل بدون إنترنت
self.addEventListener('fetch', (e) => {
  // تجاهل الطلبات التي ليست GET (مثل POST)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // إذا وجدنا الملف في الكاش، نرجعه فوراً (سرعة فائقة)
      if (cachedResponse) {
        // نقوم بتحديث الكاش في الخلفية (Stale-While-Revalidate)
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {}); // تجاهل الأخطاء في الخلفية
        return cachedResponse;
      }

      // إذا لم نجده في الكاش، نجلبه من الإنترنت ونحفظه
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // إذا فشل الاتصال ولم يوجد الملف، نرجع صفحة الخطأ (اختياري)
        return caches.match('/index.html');
      });
    })
  );
});

// 4. الاستماع للإشعارات القادمة (Push)
self.addEventListener('push', function(event) {
  let data = { title: 'رفيق سيارتي', body: 'لديك تنبيه جديد', url: '/' };
  
  // ✅ إصلاح: حماية التطبيق من الانهيار إذا كان الإشعار نصياً وليس JSON
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url },
    dir: 'rtl' // ✅ دعم اللغة العربية في الإشعار
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. النقر على الإشعار
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // الحصول على الرابط المطلوب فتحه
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // ✅ إصلاح: البحث عن أي نافذة مفتوحة للتطبيق (وليس فقط الصفحة الرئيسية)
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // إذا كان التطبيق مفتوحاً، قم بتركيزه وتوجيهه للرابط
        if ('focus' in client) {
          client.focus();
          if (client.navigate) {
             return client.navigate(urlToOpen);
          }
          return;
        }
      }
      // إذا لم يكن مفتوحاً، افتح نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
