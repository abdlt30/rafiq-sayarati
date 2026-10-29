import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // جلب السيارة عند فتح التطبيق
  useEffect(() => {
    const loadCar = async () => {
      try {
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

  // دالة حفظ السيارة
  const addNewCar = async (carData) => {
    try {
      const id = await db.cars.add(carData);
      const newCar = { ...carData, id };
      setCurrentCar(newCar); // تحديث الحالة فوراً
      return newCar;
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isDarkMode, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
