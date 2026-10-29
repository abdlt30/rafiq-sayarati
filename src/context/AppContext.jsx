import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCar = () => {
      try {
        // مسح أي بيانات قديمة لتجنب التداخل (للتشخيص فقط)
        // localStorage.clear(); // (أزل التعليق إذا أردت البدء من الصفر دائماً)
        
        const localCar = localStorage.getItem('savedCar');
        if (localCar) {
          setCurrentCar(JSON.parse(localCar));
        }
      } catch (error) {
        console.error("Error loading car:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCar();
  }, []);

  const addNewCar = (carData) => {
    try {
      const newCar = { ...carData, id: Date.now() };
      
      // الحفظ الفوري في الذاكرة
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      
      // تحديث الحالة (هذا سينقل المستخدم للوحة التحكم)
      setCurrentCar(newCar);
      
    } catch (error) {
      console.error("Critical error saving car:", error);
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    }
  };

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};
