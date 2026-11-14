import { createContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService'; 
import { translations } from '../locales'; 
import { safeNumber } from '../shared/utils/safeNumber'; // ✅ درع الحماية الرياضي

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ... (نفس كود الحالة السابق للسيارة والمستخدم والإعدادات)
  const [user, setUserState] = useState(() => {
    try { const savedName = localStorage.getItem('user_name'); return savedName ? { name: savedName } : null; } catch { return null; }
  });

  const setUser = useCallback((userData) => {
    setUserState(userData);
    try {
      if (userData && userData.name) localStorage.setItem('user_name', userData.name);
      else localStorage.removeItem('user_name');
    } catch (e) {}
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

  // ✅ الحالة المركزية للبيانات الحقيقية
  const [totals, setTotals] = useState({ fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0, avgConsumption: null, avgUnit: 'L/100km' });
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => setDataVersion(v => v + 1), []);

  // ✅ المعادلة الرياضية الدقيقة لجلب البيانات
  const refreshDashboard = useCallback(async () => {
    if (!currentCar) return;
    setIsLoading(true);
    try {
      // جلب البيانات الحقيقية من IndexedDB
      const fetchedTotals = await dbService.getTotals(currentCar.id);
      const fuelRecords = await dbService.getFuel() || [];
      const maintenanceRecords = await dbService.getMaintenance() || [];
      const expenseRecords = await dbService.getExpenses() || [];
      const incomeRecords = await dbService.getIncomes() || [];

      const carIdStr = String(currentCar.id);
      const filter = (arr) => (Array.isArray(arr) ? arr : []).filter(r => String(r.carId) === carIdStr);

      const myFuel = filter(fuelRecords);
      
      // 🧮 حساب الاستهلاك (مع مراعاة السيارات الكهربائية والبنزين)
      const powertrain = currentCar.powertrain || 'ice';
      const isEV = powertrain === 'ev';
      const unit = isEV ? 'kWh/100km' : 'L/100km';
      
      // نأخذ السجلات التي تحتوي على عداد وكمية وقود، بغض النظر عن نوع الطاقة (لتجنب استثناء السجلات القديمة)
      const validFuelRecords = myFuel.filter(f => 
        safeNumber(f.odometer) > 0 && 
        (safeNumber(f.amount) > 0 || safeNumber(f.liters) > 0)
      );

      let avgVal = null;
      if (validFuelRecords.length >= 2) {
        // ترتيب السجلات من الأقدم للأحدث بناءً على العداد
        const sorted = [...validFuelRecords].sort((a, b) => safeNumber(a.odometer) - safeNumber(b.odometer));
        let totalDistance = 0;
        let totalAmount = 0;

        for (let i = 1; i < sorted.length; i++) {
          const dist = safeNumber(sorted[i].odometer) - safeNumber(sorted[i - 1].odometer);
          // الأفضل رياضياً: كمية الوقود في التعبئة الحالية تُقسم على المسافة المقطوعة منذ التعبئة السابقة
          const amt = safeNumber(sorted[i].amount ?? sorted[i].liters);
          
          if (dist > 0 && amt > 0) {
            totalDistance += dist;
            totalAmount += amt;
          }
        }
        
        if (totalDistance > 0) {
          const res = (totalAmount / totalDistance) * 100;
          if (Number.isFinite(res) && res > 0) avgVal = Number(res.toFixed(1));
        }
      }

      // بناء النشاط الأخير
      const activities = [
        ...myFuel.map(f => ({ ...f, type: 'fuel' })),
        ...filter(maintenanceRecords).map(m => ({ ...m, type: 'maintenance' })),
        ...filter(expenseRecords).map(e => ({ ...e, type: 'expense' })),
        ...filter(incomeRecords).map(i => ({ ...i, type: 'income', cost: i.amount }))
      ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 4);

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

  useEffect(() => { refreshDashboard(); }, [currentCar, dataVersion, refreshDashboard]);

  // ... (باقي الكود للإعدادات واللغة والثيم وإضافة السيارات كما هو بدون تغيير)
  
  // (مقتطف من كود إضافة السيارة لتأكيد عدم التغيير)
  const validateOdometer = (input, { required = false } = {}) => {
    if (input === undefined || input === null || String(input).trim() === '') return required ? { valid: false } : { valid: true, value: 0 };
    const num = Number(String(input).trim());
    if (!Number.isFinite(num) || num < 0) return { valid: false };
    return { valid: true, value: Math.round(num) };
  };

  const addNewCar = useCallback((carData) => {
    // ... (نفس الكود السابق)
    if (!carData || typeof carData !== 'object') return false;
    const odoCheck = validateOdometer(carData.odometer, { required: false });
    if (!odoCheck.valid) return false;
    try {
      const newCar = { ...carData, odometer: odoCheck.value, id: Date.now().toString() };
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
    // ... (نفس الكود السابق)
    if (!carId || !updatedData) return false;
    try {
      const updatedVehicles = vehicles.map(v => String(v.id) === String(carId) ? { ...v, ...updatedData } : v);
      const isCurrentCar = String(currentCar?.id) === String(carId);
      const newCurrentCar = isCurrentCar ? { ...currentCar, ...updatedData } : currentCar;
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      if (isCurrentCar) localStorage.setItem('savedCar', JSON.stringify(newCurrentCar));
      setVehicles(updatedVehicles);
      if (isCurrentCar) setCurrentCar(newCurrentCar);
      bumpDataVersion();
      return true;
    } catch (e) { return false; }
  }, [vehicles, currentCar, bumpDataVersion]);

  const deleteCar = useCallback((id) => {
    // ... (نفس الكود السابق)
    if (!id) return false;
    try {
      if (dbService?.deleteCarData) dbService.deleteCarData(id);
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
    // ... (نفس الكود السابق)
    if (!car || typeof car !== 'object') return false;
    try {
      localStorage.setItem('savedCar', JSON.stringify(car));
      setCurrentCar(car);
      bumpDataVersion();
      return true;
    } catch (e) { return false; }
  }, [bumpDataVersion]);

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
