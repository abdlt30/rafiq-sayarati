import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database'; // استدعاء قاعدة البيانات

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 1. عند فتح التطبيق، نجلب أول سيارة من قاعدة البيانات
  useEffect(() => {
    const loadCar = async () => {
      try {
        const cars = await db.cars.toArray();
        if (cars.length > 0) {
          setCurrentCar(cars[0]); // نختار أول سيارة
        }
      } catch (error) {
        console.error("Error loading car:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCar();
  }, []);

  // 2. دالة لحفظ السيارة الجديدة في قاعدة البيانات
  const addNewCar = async (carData) => {
    try {
      const id = await db.cars.add(carData);
      const newCar = { ...carData, id };
      setCurrentCar(newCar);
      return newCar;
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  return (
    <AppContext.Provider 
      value={{ currentCar, addNewCar, isDarkMode, isLoading }}
    >
      {children}
    </AppContext.Provider>
  );
};
