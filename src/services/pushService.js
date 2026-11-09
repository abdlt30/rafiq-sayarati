export const pushService = {
  // 1. طلب الإذن من المستخدم
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  // 2. تسجيل Service Worker
  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    return null;
  },

  // 3. إظهار الإشعار خارج التطبيق
  showNotification: async (title, body, url = '/') => {
    if (Notification.permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body: body,
        icon: '/icon-192x192.png', // تأكد من وجود صورة في مجلد public
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        data: { url: url }
      });
    } catch (error) {
      // في حال فشل Service Worker، استخدم الطريقة التقليدية
      new Notification(title, { body });
    }
  }
};
