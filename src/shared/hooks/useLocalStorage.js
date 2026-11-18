import { useState, useEffect, useCallback } from 'react';

/**
 * ✅ Hook مخصص لحفظ واسترجاع البيانات من LocalStorage بأمان
 * @param {string} key - المفتاح الذي سيتم حفظ البيانات تحته
 * @param {any} initialValue - القيمة الافتراضية إذا لم توجد بيانات محفوظة
 */
export function useLocalStorage(key, initialValue) {
  
  // دالة لقراءة القيمة الأولية بأمان
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  // ✅ استخدام useCallback لتحسين الأداء ومنع إعادة الرسم غير الضرورية
  const setValue = useCallback((value) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key]);

  // ✅ إضافة دالة لمسح البيانات (مهمة جداً لحماية الخصوصية)
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key “${key}”:`, error);
    }
  }, [key, initialValue]);

  // ✅ إصلاح ثغرة المزامنة (معالجة حالة الحذف null)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          // إذا كانت القيمة الجديدة null، فهذا يعني أن المفتاح تم حذفه
          setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
        } catch (error) {
          console.warn(`Error parsing storage event for key “${key}”:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
