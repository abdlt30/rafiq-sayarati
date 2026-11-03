import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // حالة الثيم: 'dark' أو 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const savedCar = localStorage.getItem('savedCar');
    if (savedCar) setCurrentCar(JSON.parse(savedCar));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // تطبيق الثيم على الـ body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now() };
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    setCurrentCar(newCar);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};
