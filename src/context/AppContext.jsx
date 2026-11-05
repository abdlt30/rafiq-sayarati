import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // جلب البيانات من LocalStorage
  const getStored = (key, fallback = []) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) { return fallback; }
  };

  useEffect(() => {
    // إجبار الوضع الداكن لمنع تداخل الألوان
    document.documentElement.setAttribute('data-theme', 'dark');
    
    const savedCar = getStored('savedCar', null);
    if (savedCar) setCurrentCar(savedCar);
    
    setIsLoading(false);
  }, []);

  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now().toString() };
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    setCurrentCar(newCar);
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
