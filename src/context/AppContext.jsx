import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // دالة جلب البيانات من الذاكرة
  const getStored = (key, fallback = []) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) { return fallback; }
  };

  // الحالة العامة
  const [vehicles, setVehicles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [reminders, setReminders] = useState([]);

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    const savedCar = getStored('savedCar', null);
    if (savedCar) setCurrentCar(savedCar);
    
    setVehicles(getStored('vehicles'));
    setExpenses(getStored('expenses'));
    setFuelLogs(getStored('fuel'));
    setMaintenance(getStored('maintenance'));
    setDocuments(getStored('documents'));
    setReminders(getStored('reminders'));
    
    setIsLoading(false);
  }, []);

  // حفظ الثيم
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // دالة تبديل الوضع
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // إضافة سيارة
  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now().toString() };
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    setCurrentCar(newCar);
    
    // إضافة السيارة للقائمة أيضاً
    const updatedVehicles = [...vehicles, newCar];
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  };

  return (
    <AppContext.Provider value={{ 
      currentCar, addNewCar, isLoading, 
      theme, toggleTheme,
      vehicles, setVehicles, 
      expenses, setExpenses,
      fuelLogs, setFuelLogs,
      maintenance, setMaintenance,
      documents, setDocuments,
      reminders, setReminders
    }}>
      {children}
    </AppContext.Provider>
  );
};
