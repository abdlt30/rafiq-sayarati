import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCar = localStorage.getItem('savedCar');
    if (savedCar) {
      setCurrentCar(JSON.parse(savedCar));
    }
    setIsLoading(false);
  }, []);

  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now() };
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    setCurrentCar(newCar);
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
