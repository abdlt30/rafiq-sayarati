import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // نقرأ من localStorage مباشرة
    const savedCar = localStorage.getItem('rafiq_car');
    if (savedCar) {
      setCurrentCar(JSON.parse(savedCar));
    }
    setIsLoading(false);
  }, []);

  const addNewCar = (carData) => {
    // 1. الحفظ الفوري
    const newCar = { ...carData, id: Date.now() };
    localStorage.setItem('rafiq_car', JSON.stringify(newCar));
    
    // 2. تحديث الحالة (هذا لن يسبب تعليقاً)
    setCurrentCar(newCar);

    // 3. التوجيه القسري (لضمان عدم التعليق)
    window.location.replace('/#/'); 
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
