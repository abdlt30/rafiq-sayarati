import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 1. تحميل البيانات عند فتح التطبيق
  useEffect(() => {
    const loadCar = async () => {
      try {
        // الأولوية القصوى: اقرأ من الذاكرة المحلية (أسرع ولا يعلق)
        const localCar = localStorage.getItem('savedCar');
        if (localCar) {
          setCurrentCar(JSON.parse(localCar));
          setIsLoading(false);
          return; // انتهينا، لا داعي لقراءة قاعدة البيانات
        }

        // إذا لم توجد في الذاكرة، جرب قاعدة البيانات
        const cars = await db.cars.toArray();
        if (cars.length > 0) {
          setCurrentCar(cars[0]);
        }
      } catch (error) {
        console.error("Error loading car:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCar();
  }, []);

  // 2. دالة الحفظ (مصممة لعدم التعليق)
  const addNewCar = async (carData) => {
    // الخطوة أ: الحفظ الفوري في الذاكرة المحلية (هذا يمنع التعليق)
    const newCar = { ...carData, id: Date.now() };
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    
    // الخطوة ب: تحديث الحالة (هذا ينقل المستخدم فوراً للوحة التحكم)
    setCurrentCar(newCar);

    // الخطوة ج: محاولة الحفظ في قاعدة البيانات (في الخلفية بدون انتظار)
    try {
      await db.cars.add(carData);
    } catch (error) {
      console.warn("لم يتم الحفظ في IndexedDB (قد يكون المتصفح خفياً), لكن البيانات آمنة في LocalStorage.");
    }
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isDarkMode, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
