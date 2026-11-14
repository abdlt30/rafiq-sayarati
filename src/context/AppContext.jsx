import { createContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService'; 
import { translations } from '../locales'; 
import { notificationService } from '../services/notificationService';
import { safeNumber } from '../shared/utils/safeNumber'; // ✅ تأكد من استيراد دالة الحماية

export const AppContext = createContext();

const generateCarId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch { /* fallback */ }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};

export const AppProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try { const savedName = localStorage.getItem('user_name'); return savedName ? { name: savedName } : null; } catch { return null; }
  });

  const setUser = useCallback((userData) => {
    setUserState(userData);
    try {
      if (userData && userData.name) localStorage.setItem('user_name', userData.name);
      else localStorage.removeItem('user_name');
    } catch (e) { console.error('Save user failed:', e); }
  }, []);

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
      if (Array.isArray(parsedVehicles) && parsedVehicles.length > 0) return parsedVehicles;
      const parsedCar = JSON.parse(localStorage.getItem('savedCar') || 'null');
      return parsedCar && typeof parsedCar === 'object' ? [parsedCar] : [];
    } catch { return []; }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { const saved = localStorage.getItem('theme'); return saved === 'light' || saved === 'dark' ? saved : 'dark'; } catch { return 'dark'; }
  });
  const [lang, setLang] = useState(() => {
    try { const saved = localStorage.getItem('lang'); return ['ar', 'en', 'fr'].includes(saved) ? saved : 'ar'; } catch { return 'ar'; }
  });
  const [currency, setCurrencyRaw] = useState(() => {
    try { const saved = localStorage.getItem('currency'); return saved && /^[A-Z]{3}$/.test(saved) ? saved : 'MAD'; } catch { return 'MAD'; }
  });

  // ✅ 1. الحالة المركزية للبيانات
  const [totals, setTotals] = useState({ fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0, avgConsumption: null, avgUnit: 'L/100km' });
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => setDataVersion(v => v + 1), []);

  // ✅ 2. دالة تحديث لوحة التحكم بالكامل (بما فيها الاستهلاك)
  const refreshDashboard = useCallback(async () => {
    if (!currentCar) return;
    setIsLoading(true);
    try {
      // 1. جلب الإحصائيات الأساسية
      const fetchedTotals = await dbService.getTotals(currentCar.id);
      
      // 2. جلب السجلات
      const fuelRecords = await dbService.getFuel() || [];
      const maintenanceRecords = await dbService.getMaintenance() || [];
      const expenseRecords = await dbService.getExpenses() || [];
      const incomeRecords = await dbService.getIncomes() || [];

      const carIdStr = String(currentCar.id);
      const filter = (arr) => (Array.isArray(arr) ? arr : []).filter(r => String(r.carId) === carIdStr);

      const myFuel = filter(fuelRecords);
      
      // ✅ 3. حساب متوسط الاستهلاك (الذي كان مفقوداً)
      const powertrain = currentCar.powertrain || 'ice';
      const targetEnergy = powertrain === 'ev' ? 'electricity' : 'gasoline';
      const unit = targetEnergy === 'electricity' ? 'kWh/100km' : 'L/100km';
      
      const carFuel = myFuel.filter(f => (f.energyType || 'gasoline') === targetEnergy);
      let avgVal = null;
      
      if (carFuel.length >= 2) {
        const normalized = carFuel.map(f => ({ ...f, _odo: safeNumber(f.odometer) })).filter(f => f._odo > 0).sort((a, b) => a._odo - b._odo);
        let tAmt = 0, tDist = 0;
        for (let i = 1; i < normalized.length; i++) {
          const dist = normalized[i]._odo - normalized[i - 1]._odo;
          const amt = safeNumber(normalized[i].amount ?? normalized[i].liters);
          if (dist > 0 && amt > 0) { tDist += dist; tAmt += amt; }
        }
        if (tDist > 0) {
          const res = (tAmt / tDist) * 100;
          if (Number.isFinite(res) && res > 0) avgVal = Number(res.toFixed(1));
        }
      }

      // 4. بناء النشاط الأخير
      const activities = [
        ...myFuel.map(f => ({ ...f, type: 'fuel' })),
        ...filter(maintenanceRecords).map(m => ({ ...m, type: 'maintenance' })),
        ...filter(expenseRecords).map(e => ({ ...e, type: 'expense' })),
        ...filter(incomeRecords).map(i => ({ ...i, type: 'income', cost: i.amount }))
      ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 4);

      // تحديث الحالة
      setTotals({ 
        ...(fetchedTotals || { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0 }),
        avgConsumption: avgVal,
        avgUnit: unit
      });
      setRecentActivity(activities);
      
    } catch (e) {
      console.error("Failed to refresh dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentCar]);

  // تحديث لوحة التحكم عند تغيير السيارة أو البيانات
  useEffect(() => {
    refreshDashboard();
  }, [currentCar, dataVersion, refreshDashboard]);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      localStorage.setItem('theme', theme);
      localStorage.setItem('lang', lang);
      localStorage.setItem('currency', currency);
    } catch (e) { console.error('Persist settings failed:', e); }
  }, [theme, lang, currency]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const changeLang = useCallback((newLang) => { if (['ar', 'en', 'fr'].includes(newLang)) setLang(newLang); }, []);
  const setCurrency = useCallback((newCurrency) => {
    if (typeof newCurrency === 'string' && /^[A-Z]{3}$/.test(newCurrency.trim())) setCurrencyRaw(newCurrency.trim());
  }, []);

  const t = useCallback((key, variables = {}) => {
    let text = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    text = String(text);
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach((varName) => {
        const placeholder = `{${varName}}`;
        if (text.includes(placeholder)) text = text.split(placeholder).join(String(variables[varName] ?? ''));
      });
    }
    return text;
  }, [lang]);

  const validateOdometer = (input, { required = false } = {}) => {
    if (input === undefined || input === null || String(input).trim() === '') return required ? { valid: false } : { valid: true, value: 0 };
    const num = Number(String(input).trim());
    if (!Number.isFinite(num) || num < 0) return { valid: false };
    return { valid: true, value: Math.round(num) };
  };

  const addNewCar = useCallback((carData) => {
    if (!carData || typeof carData !== 'object') return false;
    const odoCheck = validateOdometer(carData.odometer, { required: false });
    if (!odoCheck.valid) return false;

    try {
      const newCar = { ...carData, odometer: odoCheck.value, id: generateCarId() };
      const updatedVehicles = [...vehicles, newCar];
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      setCurrentCar(newCar);
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (e) { return false; }
  }, [vehicles, bumpDataVersion]);

  const updateCar = useCallback((carId, updatedData) => {
    if (!carId || !updatedData || typeof updatedData !== 'object') return false;
    if (!vehicles.some(v => String(v.id) === String(carId))) return false;

    const sanitized = { ...updatedData };
    if (sanitized.odometer !== undefined) {
      const odoCheck = validateOdometer(sanitized.odometer, { required: true });
      if (!odoCheck.valid) return false;
      sanitized.odometer = odoCheck.value;
    }

    try {
      const updatedVehicles = vehicles.map(v => String(v.id) === String(carId) ? { ...v, ...sanitized } : v);
      const isCurrentCar = String(currentCar?.id) === String(carId);
      const newCurrentCar = isCurrentCar ? { ...currentCar, ...sanitized } : currentCar;
      
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      if (isCurrentCar) localStorage.setItem('savedCar', JSON.stringify(newCurrentCar));
      
      setVehicles(updatedVehicles);
      if (isCurrentCar) setCurrentCar(newCurrentCar);
      bumpDataVersion();
      return true;
    } catch (e) { return false; }
  }, [vehicles, currentCar, bumpDataVersion]);

  const deleteCar = useCallback((id) => {
    if (!id) return false;
    try {
      if (dbService?.deleteCarData) {
        try { const res = dbService.deleteCarData(id); if (res instanceof Promise) res.catch(console.error); } catch (dbErr) {}
      }
      const updatedVehicles = vehicles.filter(v => String(v.id) !== String(id));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

      if (String(currentCar?.id) === String(id)) {
        const nextCar = updatedVehicles.length > 0 ? updatedVehicles[0] : null;
        setCurrentCar(nextCar);
        if (nextCar) localStorage.setItem('savedCar', JSON.stringify(nextCar));
        else localStorage.removeItem('savedCar');
      }
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (e) { return false; }
  }, [vehicles, currentCar, bumpDataVersion]);

  const selectCar = useCallback((car) => {
    if (!car || typeof car !== 'object') return false;
    try {
      localStorage.setItem('savedCar', JSON.stringify(car));
      setCurrentCar(car);
      bumpDataVersion();
      return true;
    } catch (e) { return false; }
  }, [bumpDataVersion]);

  return (
    <AppContext.Provider value={{ 
      currentCar, vehicles, addNewCar, updateCar, deleteCar, selectCar, 
      isLoading, setIsLoading, theme, toggleTheme, lang, changeLang, currency, setCurrency, t,
      user, setUser, dataVersion, bumpDataVersion,
      totals, recentActivity, refreshDashboard
    }}>
      {children}
    </AppContext.Provider>
  );
};
