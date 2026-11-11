import { createContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService'; 
import { translations } from '../locales'; 

export const AppContext = createContext();

/* ✅ توليد IDs متوافق مع dbService (لا تصادم) */
const generateCarId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch { /* fallback */ }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};

/* ✅ رمي أخطاء موقّعة (بدل alert) */
const typedError = (code, message = code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

export const AppProvider = ({ children }) => {
  
  /* ===================== user ===================== */
  const [user, setUserState] = useState(() => {
    try {
      const savedName = localStorage.getItem('user_name');
      return savedName ? { name: savedName } : null;
    } catch { return null; }
  });

  const setUser = useCallback((userData) => {
    setUserState(userData);
    try {
      if (userData && userData.name) {
        localStorage.setItem('user_name', userData.name);
      } else {
        localStorage.removeItem('user_name');
      }
    } catch (e) {
      console.error('Save user failed:', e);
    }
  }, []);

  /* ===================== car ===================== */
  const [currentCar, setCurrentCar] = useState(() => {
    try {
      const saved = localStorage.getItem('savedCar');
      if (!saved || saved === 'null') return null;
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  });

  const [vehicles, setVehicles] = useState(() => {
    try {
      const parsedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
      if (Array.isArray(parsedVehicles) && parsedVehicles.length > 0) {
        return parsedVehicles;
      }
      // ✅ Fallback: استخدام savedCar إذا لم توجد سيارات
      const parsedCar = JSON.parse(localStorage.getItem('savedCar') || 'null');
      return parsedCar && typeof parsedCar === 'object' ? [parsedCar] : [];
    } catch (e) {
      console.error('vehicles init failed:', e);
      return [];
    }
  });

  /* ===================== UI ===================== */
  const [isLoading] = useState(false); // محجوز للمستقبل
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch { return 'dark'; }
  });
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('lang');
      return ['ar', 'en', 'fr'].includes(saved) ? saved : 'ar';
    } catch { return 'ar'; }
  });
  const [currency, setCurrencyRaw] = useState(() => {
    try {
      const saved = localStorage.getItem('currency');
      return saved && /^[A-Z]{3}$/.test(saved) ? saved : 'MAD';
    } catch { return 'MAD'; }
  });

  /* ✅ عداد إصدار البيانات */
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      localStorage.setItem('theme', theme);
      localStorage.setItem('lang', lang);
      localStorage.setItem('currency', currency);
    } catch (e) {
      console.error('Persist settings failed:', e);
    }
  }, [theme, lang, currency]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const changeLang = useCallback((newLang) => {
    if (['ar', 'en', 'fr'].includes(newLang)) {
      setLang(newLang);
    }
  }, []);

  /* ✅ setCurrency آمن (لا يقبل قيماً غير صالحة) */
  const setCurrency = useCallback((newCurrency) => {
    if (typeof newCurrency === 'string' && /^[A-Z]{3}$/.test(newCurrency.trim())) {
      setCurrencyRaw(newCurrency.trim());
    }
  }, []);

  /* ✅ دالة الترجمة الآمنة (تدعم المتغيرات + تمنع الانهيار) */
  const t = useCallback((key, variables = {}) => {
    let text = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    text = String(text);
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach((varName) => {
        const placeholder = `{${varName}}`;
        if (text.includes(placeholder)) {
          text = text.split(placeholder).join(String(variables[varName] ?? ''));
        }
      });
    }
    return text;
  }, [lang]);

  /* ===================== التحقق من العداد ===================== */
  const validateOdometer = (input, { required = false } = {}) => {
    if (input === undefined || input === null || String(input).trim() === '') {
      return required ? { valid: false } : { valid: true, value: 0 };
    }
    const num = Number(String(input).trim());
    if (!Number.isFinite(num) || num < 0) {
      return { valid: false };
    }
    return { valid: true, value: Math.round(num) }; // ✅ يضمن عدداً صحيحاً
  };

  /* ===================== CRUD السيارات ===================== */
  const addNewCar = useCallback((carData) => {
    if (!carData || typeof carData !== 'object') {
      throw typedError('INVALID_DATA');
    }

    const odoCheck = validateOdometer(carData.odometer, { required: false });
    if (!odoCheck.valid) {
      throw typedError('INVALID_ODOMETER');
    }

    try {
      const newCar = {
        ...carData,
        odometer: odoCheck.value,
        id: generateCarId(),
      };

      const updatedVehicles = [...vehicles, newCar];
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
      setCurrentCar(newCar);
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (e) {
      console.error('addNewCar failed:', e);
      if (e.name === 'QuotaExceededError' || String(e).includes('quota')) {
        throw typedError('STORAGE_FULL');
      }
      throw e;
    }
  }, [vehicles, bumpDataVersion]);

  const updateCar = useCallback((carId, updatedData) => {
    if (!carId || !updatedData || typeof updatedData !== 'object') {
      throw typedError('INVALID_DATA');
    }

    // ✅ التحقق من وجود السيارة
    if (!vehicles.some(v => String(v.id) === String(carId))) {
      throw typedError('CAR_NOT_FOUND');
    }

    const sanitized = { ...updatedData };
    if (sanitized.odometer !== undefined) {
      const odoCheck = validateOdometer(sanitized.odometer, { required: true });
      if (!odoCheck.valid) {
        throw typedError('INVALID_ODOMETER');
      }
      sanitized.odometer = odoCheck.value;
    }

    try {
      const updatedVehicles = vehicles.map(v =>
        String(v.id) === String(carId) ? { ...v, ...sanitized } : v
      );
      
      // ✅ بناء الحالة الجديدة قبل الحفظ (transaction safety)
      const isCurrentCar = String(currentCar?.id) === String(carId);
      const newCurrentCar = isCurrentCar ? { ...currentCar, ...sanitized } : currentCar;
      
      // محاولة الحفظ
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      if (isCurrentCar) {
        localStorage.setItem('savedCar', JSON.stringify(newCurrentCar));
      }
      
      // تحديث الحالة فقط بعد نجاح الحفظ
      setVehicles(updatedVehicles);
      if (isCurrentCar) setCurrentCar(newCurrentCar);
      bumpDataVersion();
      return true;
    } catch (e) {
      console.error('updateCar failed:', e);
      if (e.name === 'QuotaExceededError' || String(e).includes('quota')) {
        throw typedError('STORAGE_FULL');
      }
      throw e;
    }
  }, [vehicles, currentCar, bumpDataVersion]);

  const deleteCar = useCallback((id) => {
    if (!id) return false;

    try {
      // حذف بيانات السيارة المرتبطة (best-effort)
      if (dbService?.deleteCarData) {
        try { dbService.deleteCarData(id); }
        catch (dbErr) { console.error('dbService.deleteCarData failed:', dbErr); }
      }

      const updatedVehicles = vehicles.filter(v => String(v.id) !== String(id));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

      if (String(currentCar?.id) === String(id)) {
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
    } catch (e) {
      console.error('deleteCar failed:', e);
      return false;
    }
  }, [vehicles, currentCar, bumpDataVersion]);

  /* ✅ selectCar يعيد boolean ويُبمب dataVersion */
  const selectCar = useCallback((car) => {
    if (!car || typeof car !== 'object') return false;
    try {
      localStorage.setItem('savedCar', JSON.stringify(car));
      setCurrentCar(car);
      bumpDataVersion(); // ✅ مهم: لضمان تحديث الصفحات
      return true;
    } catch (e) {
      console.error('selectCar failed:', e);
      return false;
    }
  }, [bumpDataVersion]);

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
