/* =========================================================
   ✅ pushService — Web Push آمن عبر المنصات
   ========================================================= */

// ✅ حد زمني للـ Promises الطويلة
const withTimeout = (promise, ms, fallback) => {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
};

// ✅ فحص دعم المتصفح
const checkSupport = () => {
  const hasNotification = typeof window !== 'undefined' && 'Notification' in window;
  const hasSW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const isIOS = /iPad|iPhone|iPod/.test(navigator?.userAgent || '');
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone === true);

  return {
    hasNotification,
    hasSW,
    isIOS,
    isStandalone,
    // ✅ على iOS، الإشعارات تعمل فقط في PWA مثبتة (iOS 16.4+)
    isSupported: hasNotification && hasSW && (!isIOS || isStandalone),
  };
};

// ✅ قراءة إذن الإشعارات بأمان
const readPermission = () => {
  try {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission || 'default';
  } catch {
    return 'unsupported';
  }
};

// ✅ انتظار Service Worker جاهز مع timeout
const waitForSWReady = async (timeoutMs = 3000) => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    return await withTimeout(navigator.serviceWorker.ready, timeoutMs, null);
  } catch (e) {
    console.error('serviceWorker.ready failed:', e);
    return null;
  }
};

export const pushService = {
  /* ===================== 1. طلب الإذن ===================== */
  requestPermission: async () => {
    const { hasNotification } = checkSupport();
    if (!hasNotification) {
      console.log('Notifications not supported.');
      return false;
    }

    // ✅ إذا كان denied مسبقاً، لا فائدة من الطلب
    if (Notification.permission === 'denied') {
      console.log('Notifications denied — user must enable from browser settings.');
      return false;
    }

    // ✅ إذا كان granted مسبقاً
    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      // بعض المتصفحات القديمة تستخدم callback API
      const result = await new Promise((resolve) => {
        try {
          const p = Notification.requestPermission(resolve);
          if (p && typeof p.then === 'function') p.then(resolve);
        } catch (e) {
          resolve('denied');
        }
      });
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  /* ===================== 2. تسجيل Service Worker ===================== */
  registerServiceWorker: async () => {
    const { hasSW } = checkSupport();
    if (!hasSW) {
      console.warn('Service Worker not supported.');
      return null;
    }

    try {
      // ✅ التحقق أولاً: هل هو مسجّل مسبقاً؟
      const existing = await navigator.serviceWorker.getRegistration('/');
      if (existing) {
        return existing;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  },

  /* ===================== 3. إظهار إشعار ===================== */
  showNotification: async (title, body, url = '/', options = {}) => {
    const { hasNotification, hasSW, isSupported } = checkSupport();

    // ✅ فحوصات مسبقة
    if (!hasNotification || !isSupported) {
      return false;
    }

    if (readPermission() !== 'granted') {
      return false;
    }

    // ✅ بناء خيارات الإشعار بشكل آمن
    const notifyOptions = {
      body: String(body || ''),
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/icon-192x192.png',
      tag: options.tag || 'default', // ✅ منع التكرار
      renotify: options.renotify === true, // ✅ إشعار جديد بنفس tag
      requireInteraction: options.requireInteraction === true, // ✅ لا يختفي
      silent: options.silent === true,
      data: { url: String(url || '/') },
      ...options.extra,
    };

    // ✅ محاولة vibrate منفصلة (قد يرمي على iOS)
    if (Array.isArray(options.vibrate)) {
      try {
        notifyOptions.vibrate = options.vibrate;
      } catch {
        // تجاهل — بعض المتصفحات لا تدعم vibrate
      }
    }

    /* ---------- المسار 1: Service Worker ---------- */
    if (hasSW) {
      const registration = await waitForSWReady(3000);

      if (registration && typeof registration.showNotification === 'function') {
        try {
          await registration.showNotification(String(title || ''), notifyOptions);
          return true;
        } catch (e) {
          console.error('registration.showNotification failed:', e);
          // نُكمل للاحتياطي أدناه
        }
      }
    }

    /* ---------- المسار 2: Notification Constructor (سطح المكتب) ---------- */
    try {
      const fallback = new Notification(String(title || ''), {
        body: notifyOptions.body,
        icon: notifyOptions.icon,
        tag: notifyOptions.tag,
        data: notifyOptions.data,
      });
      // ✅ نقرة على الإشعار تفتح الرابط
      fallback.onclick = () => {
        try {
          window.focus();
          if (url) window.location.href = url;
        } catch { /* ignore */ }
      };
      return true;
    } catch (e) {
      console.error('Fallback Notification failed:', e);
      return false;
    }
  },

  /* ===================== 4. أدوات مساعدة ===================== */
  
  /** ✅ حالة الدعم الحالية (للاستخدام في Settings) */
  getSupportInfo: () => checkSupport(),

  /** ✅ حالة الإذن الحالية */
  getPermission: () => readPermission(),

  /** ✅ هل يمكن إظهار إشعارات فعلاً؟ */
  isReady: () => {
    const { isSupported } = checkSupport();
    return isSupported && readPermission() === 'granted';
  },
};
