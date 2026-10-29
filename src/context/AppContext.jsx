import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // نبدأ بـ null دائماً
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCar = async () => {
      try {
        // قراءة السيارات من قاعدة البيانات
        const cars = await db.cars.toArray();
        if (cars && cars.length > 0) {
          setCurrentCar(cars[0]);
        }
      } catch (error) {
        console.error("Error loading car:", error);
        // إذا فشلت قاعدة البيانات، جرب الذاكرة المحلية
        const localCar = localStorage.getItem('savedCar');
        if (localCar) setCurrentCar(JSON.parse(localCar));
      } finally {
        setIsLoading(false);
      }
    };
    loadCar();
  }, []);

  const addNewCar = async (carData) => {
    try {
      const id = await db.cars.add(carData);
      const newCar = { ...carData, id };
      setCurrentCar(newCar); 
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      return newCar;
    } catch (error) {
      console.error("Error adding car, using fallback:", error);
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
