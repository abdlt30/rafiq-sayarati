import { createContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService'; 
// ✅ استدعاء ملف الترجمة المنظم
import { translations } from '../locales'; 

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  
  /* ===================== user ===================== */
  const [user, setUserState] = useState(() => {
    try {
      const savedName = localStorage.getItem('user_name');
      return savedName ? { name: savedName } : null;
    } catch (e) { return null; }
  });

  const setUser = (userData) => {
    setUserState(userData);
    if (userData && userData.name) {
      localStorage.setItem('user_name', userData.name);
    } else {
      localStorage.removeItem('user_name');
    }
  };

  /* ===================== car ===================== */
  const [currentCar, setCurrentCar] = useState(() => {
    try {
      const saved = localStorage.getItem('savedCar');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vehicles')) || [];
      if (saved.length === 0) {
        const savedCar = JSON.parse(localStorage.getItem('savedCar'));
        return savedCar ? [savedCar] : [];
      }
      return saved;
    } catch (e) { return []; }
  });

  /* ===================== UI ===================== */
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'MAD');

  /* ✅ عداد إصدار البيانات */
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', lang);
    localStorage.setItem('currency', currency);
  }, [theme, lang, currency]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const changeLang = useCallback((newLang) => {
    if (['ar', 'en', 'fr'].includes(newLang)) {
      setLang(newLang);
    }
  }, []);

  /* ✅ الدالة الاحترافية للترجمة (تدعم المتغيرات) */
  const t = useCallback((key, variables = {}) => {
    // جلب النص، وإذا لم يوجد نرجع المفتاح نفسه
    let text = translations[lang]?.[key] || translations['en']?.[key] || key;

    // استبدال المتغيرات إن وجدت
    Object.keys(variables).forEach((varName) => {
      text = text.replace(new RegExp(`{${varName}}`, 'g'), variables[varName]);
    });

    return text;
  }, [lang]);

  /* ===================== مساعد داخلي: تحقق من العداد ===================== */
  const validateOdometer = (input, { required = false } = {}) => {
    if (input === undefined || input === null || String(input).trim() === '') {
      return required ? { valid: false } : { valid: true, value: 0 };
    }
    const num = Number(input);
    if (!Number.isFinite(num) || num < 0) {
      return { valid: false };
    }
    return { valid: true, value: num };
  };

  /* ===================== CRUD السيارات ===================== */
  const addNewCar = (carData) => {
    try {
      if (!carData || typeof carData !== 'object') {
        return false;
      }

      const odoCheck = validateOdometer(carData.odometer, { required: false });
      if (!odoCheck.valid) {
        throw new Error("Invalid Odometer");
      }

      const newCar = {
        ...carData,
        odometer: odoCheck.value,
        id: Date.now().toString(),
      };

      const updatedVehicles = [...vehicles, newCar];
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      setCurrentCar(newCar);
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (error) {
      console.error("Storage Error:", error);
      if (error.message === "Invalid Odometer") {
        alert(t('invalidNumbers') || 'الرجاء إدخال أرقام صحيحة.');
      } else {
        alert(t('storageFull') || 'مساحة التخزين ممتلئة.');
      }
      return false;
    }
  };

  const updateCar = (carId, updatedData) => {
    try {
      if (!carId || !updatedData || typeof updatedData !== 'object') {
        return false;
      }

      const sanitized = { ...updatedData };
      if (sanitized.odometer !== undefined) {
        const odoCheck = validateOdometer(sanitized.odometer, { required: true });
        if (!odoCheck.valid) {
          throw new Error("Invalid Odometer");
        }
        sanitized.odometer = odoCheck.value;
      }

      const updatedVehicles = vehicles.map(v =>
        v.id === carId ? { ...v, ...sanitized } : v
      );
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

      if (currentCar?.id === carId) {
        const newCurrentCar = { ...currentCar, ...sanitized };
        localStorage.setItem('savedCar', JSON.stringify(newCurrentCar));
        setCurrentCar(newCurrentCar);
      }
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (error) {
      console.error("Storage Error:", error);
      if (error.message === "Invalid Odometer") {
        alert(t('invalidNumbers') || 'الرجاء إدخال أرقام صحيحة.');
      } else {
        alert(t('storageError') || 'مساحة التخزين ممتلئة.');
      }
      return false;
    }
  };

  const deleteCar = (id) => {
    try {
      if (!id) return false;

      if (dbService && dbService.deleteCarData) {
        try {
          dbService.deleteCarData(id);
        } catch (dbErr) {
          console.error("dbService.deleteCarData failed:", dbErr);
        }
      }

      const updatedVehicles = vehicles.filter(v => v.id !== id);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

      if (currentCar?.id === id) {
        const nextCar = updatedVehicles.length > 0 ? updatedVehicles[0] : null;
        setCurrentCar(nextCar);
        if (nextCar) {
          localStorage.setItem('savedCar', JSON.stringify(nextCar));
        } else {
          localStorage.removeItem('savedCar');
        }
      }
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (error) {
      console.error("Delete Error:", error);
      return false;
    }
  };

  const selectCar = (car) => {
    if (!car || typeof car !== 'object') return;
    localStorage.setItem('savedCar', JSON.stringify(car));
    setCurrentCar(car);
  };

  /* ===================== Context Value ===================== */
  return (
    <AppContext.Provider value={{ 
      currentCar, vehicles, addNewCar, updateCar, deleteCar, selectCar, 
      isLoading, theme, toggleTheme, lang, changeLang, currency, setCurrency, t,
      user, setUser, dataVersion, bumpDataVersion,
    }}>
      {children}
    </AppContext.Provider>
  );
};
