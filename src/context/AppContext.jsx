import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 1. عند فتح التطبيق: نجلب السيارة من Dexie، أو من LocalStorage
  useEffect(() => {
    const loadCar = async () => {
      try {
        // محاولة الجلب من قاعدة البيانات
        const cars = await db.cars.toArray();
        if (cars.length > 0) {
          setCurrentCar(cars[0]);
        } else {
          // إذا كانت فارغة، جرب LocalStorage
          const localCar = localStorage.getItem('savedCar');
          if (localCar) setCurrentCar(JSON.parse(localCar));
        }
      } catch (error) {
        console.error("Dexie Error, using LocalStorage:", error);
        const localCar = localStorage.getItem('savedCar');
        if (localCar) setCurrentCar(JSON.parse(localCar));
      } finally {
        setIsLoading(false);
      }
    };
    loadCar();
  }, []);

  // 2. دالة الحفظ الذكية
  const addNewCar = async (carData) => {
    try {
      // أ. محاولة الحفظ في Dexie
      const id = await db.cars.add(carData);
      const newCar = { ...carData, id };
      
      // ب. تحديث الحالة (هذا ما يمنع التعليق)
      setCurrentCar(newCar); 
      
      // ج. حفظ نسخة احتياطية في LocalStorage (لضمان عدم ضياع البيانات)
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      
      return newCar;
    } catch (error) {
      console.error("Error saving to Dexie, using LocalStorage:", error);
      // إذا فشل Dexie، نحفظ في LocalStorage مباشرة
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
