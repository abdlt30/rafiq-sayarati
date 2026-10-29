import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 1. تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    const loadCar = async () => {
      try {
        const cars = await db.cars.toArray();
        if (cars.length > 0) {
          setCurrentCar(cars[0]);
        }
      } catch (error) {
        console.error("خطأ في تحميل السيارة من قاعدة البيانات:", error);
        // خطة بديلة: جلب من الذاكرة المحلية إذا فشلت قاعدة البيانات
        const localCar = localStorage.getItem('savedCar');
        if (localCar) setCurrentCar(JSON.parse(localCar));
      } finally {
        setIsLoading(false);
      }
    };
    loadCar();
  }, []);

  // 2. دالة الحفظ (مصممة لعدم التعليق)
  const addNewCar = async (carData) => {
    try {
      // محاولة الحفظ في قاعدة البيانات
      const id = await db.cars.add(carData);
      const newCar = { ...carData, id };
      
      // تحديث الحالة (هذا سينقل المستخدم فوراً)
      setCurrentCar(newCar); 
      
      // حفظ نسخة احتياطية في الذاكرة المحلية
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      
      return newCar;
    } catch (error) {
      console.error("فشل الحفظ في قاعدة البيانات، جاري الحفظ في الذاكرة:", error);
      // خطة بديلة: إذا فشلت Dexie، نحفظ في LocalStorage
      const fallbackCar = { ...carData, id: Date.now() };
      setCurrentCar(fallbackCar);
      localStorage.setItem('savedCar', JSON.stringify(fallbackCar));
    }
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isDarkMode, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
