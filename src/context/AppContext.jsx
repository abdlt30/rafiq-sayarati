import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCar = () => {
      try {
        // 1. الأولوية القصوى للقراءة من الذاكرة المحلية (LocalStorage)
        const localCar = localStorage.getItem('savedCar');
        if (localCar) {
          setCurrentCar(JSON.parse(localCar));
        }
      } catch (error) {
        console.error("خطأ في قراءة الذاكرة:", error);
      } finally {
        setIsLoading(false); // انتهى التحميل فوراً
      }
    };
    loadCar();
  }, []);

  const addNewCar = (carData) => {
    try {
      const newCar = { ...carData, id: Date.now() };
      
      // 1. الحفظ الفوري في الذاكرة (يمنع التعليق)
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      
      // 2. تحديث الحالة (هذا ينقل المستخدم فوراً إلى لوحة التحكم)
      setCurrentCar(newCar);

      // 3. محاولة الحفظ في قاعدة البيانات (بدون انتظار، في الخلفية)
      db.cars.add(carData).catch(err => {
        console.warn("لم يتم الحفظ في IndexedDB، لكن البيانات آمنة في LocalStorage.");
      });
      
    } catch (error) {
      console.error("خطأ كارثي في الحفظ:", error);
    }
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
