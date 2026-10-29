import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 1. تحميل البيانات عند فتح التطبيق
  useEffect(() => {
    const loadData = async () => {
      try {
        const cars = await db.cars.toArray();
        if (cars.length > 0) {
          setCurrentCar(cars[0]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. دالة الحفظ المعمارية
  const addNewCar = async (carData) => {
    try {
      // الحفظ في قاعدة البيانات
      const id = await db.cars.add(carData);
      const newCar = { ...carData, id };
      
      // التحديث الفوري للحالة (هذا ما يحرك الموجه)
      setCurrentCar(newCar); 
      
      return newCar;
    } catch (error) {
      console.error("Error adding car:", error);
      // في حال فشل قاعدة البيانات، نحفظ في الذاكرة المحلية كخطة بديلة
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
