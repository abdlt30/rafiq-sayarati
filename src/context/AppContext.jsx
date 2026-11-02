import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCar = localStorage.getItem('rafiq_car');
    if (savedCar) {
      setCurrentCar(JSON.parse(savedCar));
    }
    setIsLoading(false);
  }, []);

  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now() };
    localStorage.setItem('rafiq_car', JSON.stringify(newCar));
    setCurrentCar(newCar);
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
