import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  // حالة جديدة: هل التطبيق لا يزال يحمل البيانات؟
  const [isLoading, setIsLoading] = useState(true); 

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
        setIsLoading(false); // انتهى التحميل
      }
    };
    loadCar();
  }, []);

  const addNewCar = async (carData) => {
    try {
      const id = await db.cars.add(carData);
      const newCar = { ...carData, id };
      setCurrentCar(newCar); // تحديث فوري
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
