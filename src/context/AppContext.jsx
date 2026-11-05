import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');

  // دالة تحميل البيانات
  useEffect(() => {
    try {
      const savedCar = JSON.parse(localStorage.getItem('savedCar'));
      const savedVehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
      
      if (savedCar) setCurrentCar(savedCar);
      setVehicles(savedVehicles);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تحديث المظهر واللغة
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', lang);
  }, [theme, lang]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const changeLang = (newLang) => setLang(newLang);

  // إضافة سيارة جديدة
  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now().toString() };
    
    // تحديث قائمة السيارات
    const updatedVehicles = [...vehicles, newCar];
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

    // تعيينها كسيارة نشطة
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    setCurrentCar(newCar);
  };

  // تبديل السيارة النشطة
  const selectCar = (car) => {
    localStorage.setItem('savedCar', JSON.stringify(car));
    setCurrentCar(car);
  };

  return (
    <AppContext.Provider value={{ 
      currentCar, 
      vehicles, 
      addNewCar, 
      selectCar,
      isLoading, 
      theme, 
      toggleTheme,
      lang,
      changeLang
    }}>
      {children}
    </AppContext.Provider>
  );
};
