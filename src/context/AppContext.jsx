import { createContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService.js';
import { translations } from '../locales/index.js';
import { safeNumber } from '../shared/utils/safeNumber.js';

export const AppContext = createContext();

const generateId = () => {
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
    try { if (userData && userData.name) localStorage.setItem('user_name', userData.name); else localStorage.removeItem('user_name'); } catch (e) { console.error(e); }
  }, []);

  const [currentCar, setCurrentCar] = useState(() => {
    try { const saved = localStorage.getItem('savedCar'); if (!saved || saved === 'null') return null; const parsed = JSON.parse(saved); return parsed && typeof parsed === 'object' ? parsed : null; } catch { return null; }
  });
  const [vehicles, setVehicles] = useState(() => {
    try { const parsedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]'); if (Array.isArray(parsedVehicles) && parsedVehicles.length > 0) return parsedVehicles; const parsedCar = JSON.parse(localStorage.getItem('savedCar') || 'null'); return parsedCar && typeof parsedCar === 'object' ? [parsedCar] : []; } catch { return []; }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => { try { const saved = localStorage.getItem('theme'); return saved === 'light' || saved === 'dark' ? saved : 'dark'; } catch { return 'dark'; } });
  const [lang, setLang] = useState(() => { try { const saved = localStorage.getItem('lang'); return ['ar', 'en', 'fr'].includes(saved) ? saved : 'ar'; } catch { return 'ar'; } });
  const [currency, setCurrencyRaw] = useState(() => { try { const saved = localStorage.getItem('currency'); return saved && /^[A-Z]{3}$/.test(saved) ? saved : 'MAD'; } catch { return 'MAD'; } });

  // ✅ إصلاح الثيم
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // ✅ الحالة المركزية
  const [totals, setTotals] = useState({ 
    fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0, 
    avgConsumption: null, avgUnit: 'L/100km', 
    costPerKm: null, totalDistance: 0, nextOilChangeOdo: null,
    distanceToEmpty: null 
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [notifications, setNotifications] = useState([]); 
  
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => setDataVersion(v => v + 1), []);

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

  const refreshDashboard = useCallback(async () => {
    if (!currentCar) {
      setTotals({ fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0, avgConsumption: null, avgUnit: 'L/100km', costPerKm: null, totalDistance: 0, nextOilChangeOdo: null, distanceToEmpty: null });
      setRecentActivity([]); setDocuments([]); setReminders([]); setMaintenanceRecords([]); setNotifications([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const fetchedTotals = await dbService.getTotals(currentCar.id);
      const fuelRecords = await dbService.getFuel() || [];
      const allMaintenance = await dbService.getMaintenance() || [];
      const expenseRecords = await dbService.getExpenses() || [];
      const incomeRecords = await dbService.getIncomes() || [];
      const allDocs = await dbService.getDocuments() || [];
      const allReminders = await dbService.getReminders() || [];

      const carIdStr = String(currentCar.id);
      const filter = (arr) => (Array.isArray(arr) ? arr : []).filter(r => String(r.carId) === carIdStr);

      const myFuel = filter(fuelRecords);
      const myMaintenance = filter(allMaintenance);
      const myDocs = filter(allDocs);
      const myReminders = filter(allReminders);

      // 1. حساب المسافة الحقيقية المقطوعة
      const allOdometerReadings = [
        ...myFuel.map(f => safeNumber(f.odometer)),
        ...myMaintenance.map(m => safeNumber(m.odometer))
      ].filter(odo => odo > 0);

      let totalDistanceDriven = 0;
      if (allOdometerReadings.length >= 2) {
        totalDistanceDriven = Math.max(...allOdometerReadings) - Math.min(...allOdometerReadings);
      }

      // ✅ دالة مساعدة لقراءة كمية الوقود مهما كان اسم الحقل
      const getFuelVolume = (record) => safeNumber(record.liters ?? record.kwh ?? record.amount ?? record.volume ?? 0);

      // 2. حساب استهلاك الوقود التراكمي
      const powertrain = currentCar.powertrain || 'ice';
      const unit = powertrain === 'ev' ? 'kWh/100km' : 'L/100km';
      
      // نستخدم دالة getFuelVolume لضمان قراءة البيانات حتى لو كان الحقل اسمه amount
      const validFuelRecords = myFuel
        .filter(f => safeNumber(f.odometer) > 0 && getFuelVolume(f) > 0)
        .sort((a, b) => safeNumber(a.odometer) - safeNumber(b.odometer));

      let avgVal = null;
      if (validFuelRecords.length >= 2) {
        const firstOdo = safeNumber(validFuelRecords[0].odometer);
        const lastOdo = safeNumber(validFuelRecords[validFuelRecords.length - 1].odometer);
        const fuelDistance = lastOdo - firstOdo;
        let totalVolume = 0;
        for (let i = 1; i < validFuelRecords.length; i++) {
          totalVolume += getFuelVolume(validFuelRecords[i]);
        }
        if (fuelDistance > 0 && totalVolume > 0) {
          const res = (totalVolume / fuelDistance) * 100;
          if (Number.isFinite(res) && res > 0 && res < 50) {
            avgVal = Number(res.toFixed(1));
          }
        }
      }

      // 3. حساب تكلفة الكيلومتر
      const actualTotalExpenses = safeNumber(fetchedTotals?.total) || 0;
      let realCostPerKm = null;
      if (totalDistanceDriven > 0 && actualTotalExpenses > 0) {
        realCostPerKm = Number((actualTotalExpenses / totalDistanceDriven).toFixed(2));
      }

      // ✅ 4. حساب توقع المسافة المتبقية (Distance To Empty) - معادلة دقيقة
      let distanceToEmpty = null;
      if (avgVal > 0 && myFuel.length > 0) {
         const sortedByOdo = [...myFuel].sort((a, b) => safeNumber(b.odometer) - safeNumber(a.odometer));
         const lastFill = sortedByOdo[0];
         const lastFillVolume = getFuelVolume(lastFill);
         
         if (lastFill && lastFillVolume > 0) {
            let remainingLiters = lastFillVolume;
            const currentOdo = safeNumber(currentCar.odometer);
            
            if (currentOdo > safeNumber(lastFill.odometer)) {
               const driven = currentOdo - safeNumber(lastFill.odometer);
               const used = (driven / 100) * avgVal;
               remainingLiters = Math.max(0, remainingLiters - used);
            }
            
            // التحقق من أن avgVal أكبر من صفر لتجنب القسمة على صفر
            if (avgVal > 0) {
               distanceToEmpty = Math.floor((remainingLiters / avgVal) * 100);
            }
         }
      }

      // 5. التنبؤ بتغيير الزيت القادم
      let nextOilChangeOdo = null;
      const oilMaintenance = myMaintenance
        .filter(m => {
          const typeStr = String(m.type || '').toLowerCase();
          const isOil = typeStr === 'oilchange' || typeStr.includes('زيت') || typeStr.includes('oil');
          return isOil && safeNumber(m.nextOdometer) > 0;
        })
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      
      if (oilMaintenance.length > 0) nextOilChangeOdo = safeNumber(oilMaintenance[0].nextOdometer);
      if (!nextOilChangeOdo) {
        const oilReminder = myReminders.find(r => {
          const titleStr = String(r.title || '').toLowerCase();
          const isOil = titleStr.includes('زيت') || titleStr.includes('oil');
          return isOil && safeNumber(r.targetOdometer) > 0;
        });
        if (oilReminder) nextOilChangeOdo = safeNumber(oilReminder.targetOdometer);
      }

      // 6. بناء سجل النشاط
      const activities = [
        ...myFuel.map(f => ({ ...f, type: 'fuel' })),
        ...myMaintenance.map(m => ({ ...m, type: 'maintenance' })),
        ...filter(expenseRecords).map(e => ({ ...e, type: 'expense' })),
        ...filter(incomeRecords).map(i => ({ ...i, type: 'income', cost: i.amount }))
      ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 5);

      // 7. محرك الإشعارات المركزي
      const generatedNotifications = [];
      const now = new Date();
      
      myDocs.forEach(doc => {
        const expDateStr = doc.expiryDate || doc.date;
        if (expDateStr) {
           const expDate = new Date(expDateStr);
           const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
           if (diffDays <= 30) {
              generatedNotifications.push({
                 id: `doc-${doc.id}`,
                 type: 'document',
                 title: `${t('documentExpiryTitle') || 'انتهاء وثيقة'} (${t(doc.type) || doc.type})`,
                 message: diffDays < 0 ? (t('expired') || 'منتهية الصلاحية!') : `${t('expiresIn') || 'تنتهي بعد'} ${diffDays} ${t('days') || 'يوم'}`,
                 isUrgent: diffDays < 0,
                 date: expDateStr
              });
           }
        }
      });

      myReminders.forEach(rem => {
         if (rem.type === 'date' && rem.targetDate) {
             const targetDate = new Date(rem.targetDate);
             const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
             if (diffDays <= 30) {
                generatedNotifications.push({
                   id: `rem-${rem.id}`,
                   type: 'reminder',
                   title: rem.title,
                   message: diffDays < 0 ? (t('overdue') || 'متأخر!') : `${t('dueIn') || 'مستحق بعد'} ${diffDays} ${t('days') || 'يوم'}`,
                   isUrgent: diffDays < 0,
                   date: rem.targetDate
                });
             }
         }
      });

      // 8. تحديث الحالة
      setTotals({ 
        ...(fetchedTotals || { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0 }),
        avgConsumption: avgVal, 
        avgUnit: unit, 
        costPerKm: realCostPerKm,
        totalDistance: totalDistanceDriven, 
        nextOilChangeOdo: nextOilChangeOdo,
        distanceToEmpty: distanceToEmpty // ✅ تمرير المسافة المتبقية
      });
      
      setRecentActivity(activities);
      setDocuments(myDocs);
      setReminders(myReminders);
      setMaintenanceRecords(myMaintenance);
      setNotifications(generatedNotifications.sort((a,b) => b.isUrgent - a.isUrgent)); 
      
    } catch (e) {
      console.error("Failed to refresh dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentCar, t]);

  useEffect(() => { refreshDashboard(); }, [currentCar, dataVersion, refreshDashboard]);

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
      const newCar = { ...carData, odometer: odoCheck.value, id: generateId() };
      setVehicles(prev => { const updated = [...prev, newCar]; localStorage.setItem('vehicles', JSON.stringify(updated)); return updated; });
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      setCurrentCar(newCar); bumpDataVersion(); return true;
    } catch (e) { return false; }
  }, [bumpDataVersion]);

  const updateCar = useCallback((carId, updatedData) => {
    if (!carId || !updatedData) return false;
    const odoCheck = validateOdometer(updatedData.odometer, { required: true });
    if (updatedData.odometer !== undefined && !odoCheck.valid) return false;
    
    try {
      const sanitized = updatedData.odometer !== undefined ? { ...updatedData, odometer: odoCheck.value } : updatedData;
      setVehicles(prev => { const updated = prev.map(v => String(v.id) === String(carId) ? { ...v, ...sanitized } : v); localStorage.setItem('vehicles', JSON.stringify(updated)); return updated; });
      setCurrentCar(prevCar => { if (String(prevCar?.id) === String(carId)) { const newCurrentCar = { ...prevCar, ...sanitized }; localStorage.setItem('savedCar', JSON.stringify(newCurrentCar)); return newCurrentCar; } return prevCar; });
      bumpDataVersion(); return true;
    } catch (e) { return false; }
  }, [bumpDataVersion]);

  const deleteCar = useCallback(async (id) => {
    if (!id) return false;
    try {
      if (dbService?.deleteCarData) await dbService.deleteCarData(id);
      setVehicles(prev => {
        const updated = prev.filter(v => String(v.id) !== String(id));
        localStorage.setItem('vehicles', JSON.stringify(updated));
        setCurrentCar(prevCar => { if (String(prevCar?.id) === String(id)) { const nextCar = updated.length > 0 ? updated[0] : null; if (nextCar) localStorage.setItem('savedCar', JSON.stringify(nextCar)); else localStorage.removeItem('savedCar'); return nextCar; } return prevCar; });
        return updated;
      });
      bumpDataVersion(); return true;
    } catch (e) { return false; }
  }, [bumpDataVersion]);

  const selectCar = useCallback((car) => {
    if (!car || typeof car !== 'object') return false;
    try { localStorage.setItem('savedCar', JSON.stringify(car)); setCurrentCar(car); bumpDataVersion(); return true; } catch (e) { return false; }
  }, [bumpDataVersion]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const changeLang = useCallback((newLang) => { if (['ar', 'en', 'fr'].includes(newLang)) setLang(newLang); }, []);
  const setCurrency = useCallback((newCurrency) => { if (typeof newCurrency === 'string' && /^[A-Z]{3}$/.test(newCurrency.trim())) setCurrencyRaw(newCurrency.trim()); }, []);

  return (
    <AppContext.Provider value={{ 
      currentCar, vehicles, addNewCar, updateCar, deleteCar, selectCar, 
      isLoading, setIsLoading, theme, toggleTheme, lang, changeLang, currency, setCurrency, t,
      user, setUser, dataVersion, bumpDataVersion,
      totals, recentActivity, refreshDashboard,
      documents, reminders, maintenanceRecords, notifications 
    }}>
      {children}
    </AppContext.Provider>
  );
};
