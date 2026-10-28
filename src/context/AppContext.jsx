import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // السيارة الحالية
  const [currentCar, setCurrentCar] = useState(() => {
    const saved = localStorage.getItem('currentCar');
    return saved ? JSON.parse(saved) : null;
  });

  // الوضع الداكن (ثابت كـ True حالياً كما خططنا)
  const [isDarkMode] = useState(true);

  useEffect(() => {
    if (currentCar) {
      localStorage.setItem('currentCar', JSON.stringify(currentCar));
    } else {
      localStorage.removeItem('currentCar');
    }
  }, [currentCar]);

  return (
    <AppContext.Provider value={{ currentCar, setCurrentCar, isDarkMode }}>
      {children}
    </AppContext.Provider>
  );
};
