// مفاتيح التخزين المحلي
const KEYS = {
  FUEL: 'fuel_records',
  EXPENSES: 'expenses_records',
  MAINTENANCE: 'maintenance_records',
  DOCUMENTS: 'documents_records',
  REMINDERS: 'reminders_records',
  CUSTOM_MAINTENANCE: 'custom_maintenance_types', // ✅ مفتاح جديد للأنواع المخصصة
};

// دالة مساعدة لإنشاء معرف فريد (متوافق مع Supabase UUID)
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).substring(2);
};

// مصنع لإدارة عمليات التخزين (يمنع تكرار الكود)
const createLocalStore = (storageKey) => ({
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (e) {
      console.error(`Error reading ${storageKey}:`, e);
      return [];
    }
  },
  add: (record) => {
    try {
      const records = JSON.parse(localStorage.getItem(storageKey)) || [];
      const newRecord = { ...record, id: generateId(), createdAt: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify([newRecord, ...records]));
      return newRecord;
    } catch (e) {
      console.error(`Error adding to ${storageKey}:`, e);
      alert('حدث خطأ أثناء الحفظ، قد تكون مساحة التخزين ممتلئة.');
      return null;
    }
  },
  update: (id, updatedRecord) => {
    try {
      const records = JSON.parse(localStorage.getItem(storageKey)) || [];
      const updated = records.map(r => r.id === id ? { ...r, ...updatedRecord, updatedAt: new Date().toISOString() } : r);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error(`Error updating ${storageKey}:`, e);
      alert('حدث خطأ أثناء التعديل، قد تكون مساحة التخزين ممتلئة.');
      return [];
    }
  },
  delete: (id) => {
    try {
      const records = JSON.parse(localStorage.getItem(storageKey)) || [];
      const updated = records.filter(r => r.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error(`Error deleting from ${storageKey}:`, e);
      return [];
    }
  }
});

// إنشاء كائنات الخدمة لكل قسم
const fuelStore = createLocalStore(KEYS.FUEL);
const expenseStore = createLocalStore(KEYS.EXPENSES);
const maintenanceStore = createLocalStore(KEYS.MAINTENANCE);
const documentStore = createLocalStore(KEYS.DOCUMENTS);
const reminderStore = createLocalStore(KEYS.REMINDERS);

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

  // ==========================================
  // ✅ الأنواع المخصصة للصيانة (Custom Maintenance)
  // ==========================================
  getCustomTypes: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.CUSTOM_MAINTENANCE)) || [];
    } catch (e) {
      return [];
    }
  },
  addCustomType: (typeName) => {
    try {
      const types = dbService.getCustomTypes();
      if (!types.includes(typeName)) {
        const updated = [...types, typeName];
        localStorage.setItem(KEYS.CUSTOM_MAINTENANCE, JSON.stringify(updated));
        return updated;
      }
      return types;
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

  // --- الإحصائيات العامة ---
  getTotals: (carId) => {
    const filterByCar = (records) => records.filter(r => !r.carId || String(r.carId) === String(carId));
    
    const fuel = filterByCar(dbService.getFuel());
    const maintenance = filterByCar(dbService.getMaintenance());
    const expenses = filterByCar(dbService.getExpenses());

    const totalFuel = fuel.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const totalMaint = maintenance.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const totalExp = expenses.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const totalLiters = fuel.reduce((sum, r) => sum + (Number(r.liters) || 0), 0);

    return { 
      fuel: totalFuel, 
      maintenance: totalMaint, 
      expenses: totalExp, 
      total: totalFuel + totalMaint + totalExp, 
      totalLiters 
    };
  }
};

/* 
  =========================================================
  🚀 خطة المستقبل (عند الانتقال إلى Supabase):
  =========================================================
  عندما نصل لمرحلة Supabase، سنقوم فقط بتعديل هذا الملف.
  سنقوم باستبدال دوال localStorage بـ:
  
  get: async () => {
    const { data, error } = await supabase.from('fuel').select('*').eq('car_id', carId);
    return data;
  },
  add: async (record) => {
    const { data, error } = await supabase.from('fuel').insert([record]).select();
    return data[0];
  }
  
  ...وهكذا لبقية الدوال. 
  المكونات (Components) لن تحتاج إلى أي تعديل لأنها تستدعي dbService.
  =========================================================
*/
