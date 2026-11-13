import { useState, useEffect } from 'react';

/**
 * ✅ Hook مخصص لحفظ واسترجاع البيانات من LocalStorage بأمان
 * @param {string} key - المفتاح الذي سيتم حفظ البيانات تحته
 * @param {any} initialValue - القيمة الافتراضية إذا لم توجد بيانات محفوظة
 */
export function useLocalStorage(key, initialValue) {
  
  // ✅ دالة لقراءة القيمة الأولية بأمان (تمنع انهيار التطبيق إذا كانت البيانات تالفة)
  const readValue = () => {
    // التأكد من أننا في بيئة متصفح (وليس سيرفر) لمنع أخطاء SSR
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // تحويل النص إلى كائن JSON، أو إرجاع القيمة الافتراضية
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  // استخدام useState مع دالة القراءة الآمنة
  const [storedValue, setStoredValue] = useState(readValue);

  // ✅ دالة التحديث التي تحفظ القيمة في State وفي LocalStorage
  const setValue = (value) => {
    try {
      // دعم التحديث الوظيفي (مثل setState تماماً) إذا تم تمرير دالة
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 1. تحديث حالة React
      setStoredValue(valueToStore);
      
      // 2. الحفظ في المتصفح
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  // ✅ ميزة خبير: مزامنة البيانات إذا كان التطبيق مفتوحاً في أكثر من تبويب (Tab)
  useEffect(() => {
    const handleStorageChange = (event) => {
      // تحديث الحالة فقط إذا كان التغيير يخص هذا المفتاح
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key “${key}”:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
