// ==========================================
// مفاتيح التخزين المحلي
// ==========================================
const KEYS = {
  FUEL: 'fuel_records',
  EXPENSES: 'expenses_records',
  MAINTENANCE: 'maintenance_records',
  DOCUMENTS: 'documents_records',
  REMINDERS: 'reminders_records',
  INCOMES: 'income_records',
  CUSTOM_MAINTENANCE: 'custom_maintenance_types',
};

const MAX_CUSTOM_TYPES = 50;
const EMPTY_TOTALS = {
  fuel: 0, maintenance: 0, expenses: 0, total: 0,
  totalLiters: 0, totalKwh: 0, income: 0, net: 0
};

// ==========================================
// ✅ مساعدات رياضية آمنة
// ==========================================
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // بعض المتصفحات ترمي في غير HTTPS — نكمل للـ fallback
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};

// ✅ يرفض NaN, Infinity, -Infinity, ويرجع 0
const safeNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ✅ كمية الوقود: يدعم amount الجديد + liters القديم
const getFuelAmount = (r) => {
  if (r.amount !== undefined && r.amount !== null && r.amount !== '') {
    return safeNumber(r.amount);
  }
  return safeNumber(r.liters);
};

// ==========================================
// ✅ مصنع التخزين
// ==========================================
const createLocalStore = (storageKey) => ({
  get: () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return [];
      const parsed = JSON.parse(raw);
      // ✅ تحقق أن البيانات مصفوفة (تحصين ضد التلاعب)
      if (!Array.isArray(parsed)) {
        console.warn(`Corrupt data in ${storageKey} — expected array, resetting`);
        return [];
      }
      return parsed;
    } catch (e) {
      console.error(`Error reading ${storageKey}:`, e);
      return [];
    }
  },

  add: (record) => {
    try {
      if (!record || typeof record !== 'object') {
        console.warn(`Invalid record for ${storageKey}`);
        return null;
      }
      const records = JSON.parse(localStorage.getItem(storageKey)) || [];
      const newRecord = { 
        ...record, 
        id: generateId(), 
        createdAt: new Date().toISOString() 
      };
      localStorage.setItem(storageKey, JSON.stringify([newRecord, ...records]));
      return newRecord;
    } catch (e) {
      console.error(`Error adding to ${storageKey}:`, e);
      // ✅ نرمي خطأ محدد للـ quota ليعالجه المستدعي
      if (e.name === 'QuotaExceededError' || String(e).includes('quota')) {
        const err = new Error('quota_exceeded');
        err.name = 'QuotaExceededError';
        throw err;
      }
      return null;
    }
  },

  update: (id, updates) => {
    try {
      if (!id || !updates || typeof updates !== 'object') return [];
      
      const records = JSON.parse(localStorage.getItem(storageKey)) || [];
      if (!records.some(r => r.id === id)) {
        console.warn(`Record ${id} not found in ${storageKey}`);
        return records;
      }

      const updated = records.map(r => {
        if (r.id !== id) return r;
        // ✅ ID و createdAt غير قابلين للتعديل (يُعاد فرضهما بعد الـ spread)
        return { 
          ...r, 
          ...updates, 
          id: r.id, 
          createdAt: r.createdAt,
          updatedAt: new Date().toISOString() 
        };
      });
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error(`Error updating ${storageKey}:`, e);
      if (e.name === 'QuotaExceededError') {
        const err = new Error('quota_exceeded');
        err.name = 'QuotaExceededError';
        throw err;
      }
      return [];
    }
  },

  delete: (id) => {
    try {
      if (!id) return [];
      const records = JSON.parse(localStorage.getItem(storageKey)) || [];
      const updated = records.filter(r => r.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error(`Error deleting from ${storageKey}:`, e);
      return [];
    }
  },
});

// ==========================================
// إنشاء كائنات الخدمة
// ==========================================
const fuelStore = createLocalStore(KEYS.FUEL);
const expenseStore = createLocalStore(KEYS.EXPENSES);
const maintenanceStore = createLocalStore(KEYS.MAINTENANCE);
const documentStore = createLocalStore(KEYS.DOCUMENTS);
const reminderStore = createLocalStore(KEYS.REMINDERS);
const incomeStore = createLocalStore(KEYS.INCOMES);

// ==========================================
// ✅ فلتر آمن حسب السيارة
// ==========================================
const filterByCar = (records, carId) => {
  if (!Array.isArray(records) || carId === undefined || carId === null) return [];
  const target = String(carId);
  return records.filter(r => 
    r && r.carId != null && String(r.carId) === target
  );
};

// ==========================================
// ✅ الكائن الرئيسي
// ==========================================
export const dbService = {
  // --- الوقود ---
  getFuel: fuelStore.get,
  addFuel: fuelStore.add,
  updateFuel: fuelStore.update,
  deleteFuel: fuelStore.delete,

  // --- المصاريف ---
  getExpenses: expenseStore.get,
  addExpense: expenseStore.add,
  updateExpense: expenseStore.update,
  deleteExpense: expenseStore.delete,

  // --- الصيانة ---
  getMaintenance: maintenanceStore.get,
  addMaintenance: maintenanceStore.add,
  updateMaintenance: maintenanceStore.update,
  deleteMaintenance: maintenanceStore.delete,

  // --- الوثائق ---
  getDocuments: documentStore.get,
  addDocument: documentStore.add,
  updateDocument: documentStore.update,
  deleteDocument: documentStore.delete,

  // --- التذكيرات ---
  getReminders: reminderStore.get,
  addReminder: reminderStore.add,
  updateReminder: reminderStore.update,
  deleteReminder: reminderStore.delete,

  // --- الإيرادات ---
  getIncomes: incomeStore.get,
  addIncome: incomeStore.add,
  updateIncome: incomeStore.update,
  deleteIncome: incomeStore.delete,

  // ==========================================
  // ✅ الأنواع المخصصة للصيانة
  // ==========================================
  getCustomTypes: () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEYS.CUSTOM_MAINTENANCE));
      if (!Array.isArray(parsed)) return [];
      // ✅ تطبيع: نصوص فقط، بلا فراغات
      return parsed.filter(t => typeof t === 'string' && t.trim() !== '');
    } catch (e) {
      console.error("Error reading custom types:", e);
      return [];
    }
  },

  addCustomType: (typeName) => {
    try {
      const trimmed = String(typeName || '').trim();
      if (!trimmed) return dbService.getCustomTypes();

      const types = dbService.getCustomTypes();
      
      // ✅ سقف حماية localStorage
      if (types.length >= MAX_CUSTOM_TYPES) {
        console.warn(`Max custom types (${MAX_CUSTOM_TYPES}) reached`);
        return types;
      }

      // ✅ منع التكرار (case-insensitive)
      const exists = types.some(t => t.toLowerCase() === trimmed.toLowerCase());
      if (exists) return types;

      const updated = [...types, trimmed];
      localStorage.setItem(KEYS.CUSTOM_MAINTENANCE, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Error adding custom type:", e);
      return [];
    }
  },

  deleteCustomType: (typeName) => {
    try {
      const types = dbService.getCustomTypes();
      const updated = types.filter(t => t !== typeName);
      localStorage.setItem(KEYS.CUSTOM_MAINTENANCE, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  // ==========================================
  // ✅ الإحصائيات العامة
  // ==========================================
  getTotals: (carId) => {
    if (carId === undefined || carId === null) return { ...EMPTY_TOTALS };

    const fuel = filterByCar(fuelStore.get(), carId);
    const maintenance = filterByCar(maintenanceStore.get(), carId);
    const expenses = filterByCar(expenseStore.get(), carId);
    const incomes = filterByCar(incomeStore.get(), carId);

    // ✅ safeNumber يحمي من NaN/Infinity
    const totalFuel = fuel.reduce((s, r) => s + safeNumber(r.cost), 0);
    const totalMaint = maintenance.reduce((s, r) => s + safeNumber(r.cost), 0);
    const totalExp = expenses.reduce((s, r) => s + safeNumber(r.cost), 0);

    // ✅ totalLiters = بنزين فقط (توافق عكسي)
    // ✅ totalKwh = كهرباء فقط (جديد لدعم EV)
    // ✅ يستخدم amount ?? liters
    let totalLiters = 0;
    let totalKwh = 0;
    fuel.forEach(r => {
      const amt = getFuelAmount(r);
      const energy = r.energyType || 'gasoline';
      if (energy === 'electricity') {
        totalKwh += amt;
      } else {
        totalLiters += amt;
      }
    });

    const totalIncome = incomes.reduce((s, r) => s + safeNumber(r.amount), 0);
    const totalExpensesCombined = totalFuel + totalMaint + totalExp;
    const netProfit = totalIncome - totalExpensesCombined;

    return { 
      fuel: totalFuel, 
      maintenance: totalMaint, 
      expenses: totalExp, 
      total: totalExpensesCombined, 
      totalLiters,      // بنزين فقط (L)
      totalKwh,         // كهرباء فقط (kWh) — جديد
      income: totalIncome,
      net: netProfit
    };
  },

  // ==========================================
  // ✅ حذف جميع بيانات سيارة معينة
  // ==========================================
  deleteCarData: (carId) => {
    if (carId === undefined || carId === null) return false;

    const filterOutCar = (records) => {
      if (!Array.isArray(records)) return [];
      const target = String(carId);
      return records.filter(r => String(r.carId) !== target);
    };

    const stores = [
      ['FUEL', KEYS.FUEL, fuelStore],
      ['EXPENSES', KEYS.EXPENSES, expenseStore],
      ['MAINTENANCE', KEYS.MAINTENANCE, maintenanceStore],
      ['DOCUMENTS', KEYS.DOCUMENTS, documentStore],
      ['REMINDERS', KEYS.REMINDERS, reminderStore],
      ['INCOMES', KEYS.INCOMES, incomeStore],
    ];

    let allSucceeded = true;
    stores.forEach(([name, key, store]) => {
      try {
        const filtered = filterOutCar(store.get());
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch (e) {
        console.error(`Error purging ${name}:`, e);
        allSucceeded = false;
      }
    });

    return allSucceeded;
  },
};

/* 
  =========================================================
  🚀 خطة المستقبل (عند الانتقال إلى Supabase):
  =========================================================
  المكونات (Components) لن تحتاج تعديلاً — فقط استبدال الدوال هنا:
  
  get: async () => {
    const { data } = await supabase.from('fuel').select('*').eq('car_id', carId);
    return data;
  },
  add: async (record) => {
    const { data } = await supabase.from('fuel').insert([record]).select();
    return data[0];
  }
  =========================================================
*/
