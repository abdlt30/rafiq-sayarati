import localforage from 'localforage';

// ==========================================
// ✅ إعداد قاعدة البيانات (IndexedDB)
// ==========================================
const db = localforage.createInstance({
  name: 'RafiqSayaratiDB',
  storeName: 'appData'
});

// ✅ مفاتيح التخزين
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
    try { return crypto.randomUUID(); } catch (e) { /* fallback */ }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};

const safeNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getFuelAmount = (r) => {
  if (r.amount !== undefined && r.amount !== null && r.amount !== '') {
    return safeNumber(r.amount);
  }
  return safeNumber(r.liters);
};

// ==========================================
// ✅ مصنع التخزين (الآن يعتمد على IndexedDB)
// ==========================================
const createIndexedStore = (storageKey) => {
  
  const get = async () => {
    try {
      const data = await db.getItem(storageKey);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(`Error reading ${storageKey}:`, e);
      return [];
    }
  };

  return {
    get,
    
    add: async (record) => {
      try {
        if (!record || typeof record !== 'object') return null;
        const records = await get();
        const newRecord = { 
          ...record, 
          id: generateId(), 
          createdAt: new Date().toISOString() 
        };
        await db.setItem(storageKey, [newRecord, ...records]);
        return newRecord;
      } catch (e) {
        console.error(`Error adding to ${storageKey}:`, e);
        return null;
      }
    },

    update: async (id, updates) => {
      try {
        if (!id || !updates || typeof updates !== 'object') return await get();
        const records = await get();
        
        if (!records.some(r => r.id === id)) {
          console.warn(`Record ${id} not found in ${storageKey}`);
          return records;
        }

        const updated = records.map(r => {
          if (r.id !== id) return r;
          return { 
            ...r, 
            ...updates, 
            id: r.id, 
            createdAt: r.createdAt,
            updatedAt: new Date().toISOString() 
          };
        });
        await db.setItem(storageKey, updated);
        return updated;
      } catch (e) {
        console.error(`Error updating ${storageKey}:`, e);
        return await get();
      }
    },

    delete: async (id) => {
      try {
        if (!id) return await get();
        const records = await get();
        const updated = records.filter(r => r.id !== id);
        await db.setItem(storageKey, updated);
        return updated;
      } catch (e) {
        console.error(`Error deleting from ${storageKey}:`, e);
        return await get();
      }
    },
  };
};

// ==========================================
// إنشاء كائنات الخدمة
// ==========================================
const fuelStore = createIndexedStore(KEYS.FUEL);
const expenseStore = createIndexedStore(KEYS.EXPENSES);
const maintenanceStore = createIndexedStore(KEYS.MAINTENANCE);
const documentStore = createIndexedStore(KEYS.DOCUMENTS);
const reminderStore = createIndexedStore(KEYS.REMINDERS);
const incomeStore = createIndexedStore(KEYS.INCOMES);

// ==========================================
// ✅ فلتر آمن حسب السيارة
// ==========================================
const filterByCar = (records, carId) => {
  if (!Array.isArray(records) || carId === undefined || carId === null) return [];
  const target = String(carId);
  return records.filter(r => r && r.carId != null && String(r.carId) === target);
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
  getCustomTypes: async () => {
    try {
      const parsed = await db.getItem(KEYS.CUSTOM_MAINTENANCE);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(t => typeof t === 'string' && t.trim() !== '');
    } catch (e) {
      return [];
    }
  },

  addCustomType: async (typeName) => {
    try {
      const trimmed = String(typeName || '').trim();
      if (!trimmed) return await dbService.getCustomTypes();

      const types = await dbService.getCustomTypes();
      if (types.length >= MAX_CUSTOM_TYPES) return types;

      const exists = types.some(t => t.toLowerCase() === trimmed.toLowerCase());
      if (exists) return types;

      const updated = [...types, trimmed];
      await db.setItem(KEYS.CUSTOM_MAINTENANCE, updated);
      return updated;
    } catch (e) {
      return [];
    }
  },

  deleteCustomType: async (typeName) => {
    try {
      const types = await dbService.getCustomTypes();
      const updated = types.filter(t => t !== typeName);
      await db.setItem(KEYS.CUSTOM_MAINTENANCE, updated);
      return updated;
    } catch (e) {
      return [];
    }
  },

  // ==========================================
  // ✅ الإحصائيات العامة (أصبحت async)
  // ==========================================
  getTotals: async (carId) => {
    if (carId === undefined || carId === null) return { ...EMPTY_TOTALS };

    try {
      const fuel = filterByCar(await fuelStore.get(), carId);
      const maintenance = filterByCar(await maintenanceStore.get(), carId);
      const expenses = filterByCar(await expenseStore.get(), carId);
      const incomes = filterByCar(await incomeStore.get(), carId);

      const totalFuel = fuel.reduce((s, r) => s + safeNumber(r.cost), 0);
      const totalMaint = maintenance.reduce((s, r) => s + safeNumber(r.cost), 0);
      const totalExp = expenses.reduce((s, r) => s + safeNumber(r.cost), 0);

      let totalLiters = 0;
      let totalKwh = 0;
      fuel.forEach(r => {
        const amt = getFuelAmount(r);
        const energy = r.energyType || 'gasoline';
        if (energy === 'electricity') totalKwh += amt;
        else totalLiters += amt;
      });

      const totalIncome = incomes.reduce((s, r) => s + safeNumber(r.amount), 0);
      const totalExpensesCombined = totalFuel + totalMaint + totalExp;
      const netProfit = totalIncome - totalExpensesCombined;

      return { 
        fuel: totalFuel, maintenance: totalMaint, expenses: totalExp, 
        total: totalExpensesCombined, totalLiters, totalKwh, 
        income: totalIncome, net: netProfit
      };
    } catch (e) {
      console.error("Error calculating totals:", e);
      return { ...EMPTY_TOTALS };
    }
  },

  // ==========================================
  // ✅ حذف جميع بيانات سيارة معينة (أصبحت async)
  // ==========================================
  deleteCarData: async (carId) => {
    if (carId === undefined || carId === null) return false;

    const filterOutCar = (records) => {
      if (!Array.isArray(records)) return [];
      const target = String(carId);
      return records.filter(r => String(r.carId) !== target);
    };

    const stores = [
      [KEYS.FUEL, fuelStore], [KEYS.EXPENSES, expenseStore],
      [KEYS.MAINTENANCE, maintenanceStore], [KEYS.DOCUMENTS, documentStore],
      [KEYS.REMINDERS, reminderStore], [KEYS.INCOMES, incomeStore],
    ];

    try {
      for (const [key, store] of stores) {
        const records = await store.get();
        const filtered = filterOutCar(records);
        await db.setItem(key, filtered);
      }
      return true;
    } catch (e) {
      console.error(`Error purging car data:`, e);
      return false;
    }
  },
};
