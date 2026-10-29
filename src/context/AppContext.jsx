import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCar = async () => {
      try {
        // 1. محاولة القراءة من الذاكرة المحلية
        const localCar = localStorage.getItem('savedCar');
        if (localCar) {
          try {
            setCurrentCar(JSON.parse(localCar));
          } catch (e) {
            console.error("خطأ في قراءة البيانات المحلية:", e);
            localStorage.removeItem('savedCar'); // مسح البيانات التالفة
          }
        } else {
          // 2. إذا لم توجد، اقرأ من قاعدة البيانات
          const cars = await db.cars.toArray();
          if (cars && cars.length > 0) {
            setCurrentCar(cars[0]);
          }
        }
      } catch (error) {
        console.error("خطأ في تحميل السيارة:", error);
      } finally {
        setIsLoading(false); // إنهاء التحميل في كل الأحوال
      }
    };
    loadCar();
  }, []);

  const addNewCar = async (carData) => {
    try {
      const newCar = { ...carData, id: Date.now() };
      // 1. الحفظ الفوري (يمنع التعليق)
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      setCurrentCar(newCar);

      // 2. الحفظ في قاعدة البيانات (بدون انتظار)
      db.cars.add(carData).catch(err => console.warn("فشل الحفظ في DB:", err));
      
      return newCar;
    } catch (error) {
      console.error("خطأ كارثي أثناء الحفظ:", error);
      alert("حدث خطأ أثناء الحفظ. يرجى المحاولة.");
    }
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isDarkMode, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
