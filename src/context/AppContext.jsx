import { createContext, useState, useEffect } from 'react';
import { db } from '../db/database';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      // نقرأ من LocalStorage أولاً (سريع ولا يعلق)
      const savedCar = localStorage.getItem('rafiq_car');
      if (savedCar) {
        setCurrentCar(JSON.parse(savedCar));
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now() };
    
    // 1. الحفظ الفوري في الذاكرة المحلية (يمنع التعليق)
    localStorage.setItem('rafiq_car', JSON.stringify(newCar));
    
    // 2. تحديث الحالة (هذا ينقل المستخدم للوحة التحكم فوراً)
    setCurrentCar(newCar);

    // 3. الحفظ في Dexie في الخلفية (لمنع التعليق)
    db.cars.add(newCar).catch(err => console.warn("DB Save failed:", err));
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
