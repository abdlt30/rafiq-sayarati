const FUEL_KEY = 'fuel_records';
const EXPENSES_KEY = 'expenses_records';
const MAINTENANCE_KEY = 'maintenance_records';

export const dbService = {
  // --- الوقود ---
  getFuelRecords: () => JSON.parse(localStorage.getItem(FUEL_KEY)) || [],
  addFuelRecord: (record) => {
    const records = dbService.getFuelRecords();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(FUEL_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },
  deleteFuelRecord: (id) => {
    const records = dbService.getFuelRecords();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem(FUEL_KEY, JSON.stringify(updated));
    return updated;
  },
  updateFuelRecord: (id, updatedRecord) => {
    const records = dbService.getFuelRecords();
    const updated = records.map(r => r.id === id ? { ...r, ...updatedRecord } : r);
    localStorage.setItem(FUEL_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- المصاريف ---
  getExpenses: () => JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [],
  addExpense: (record) => {
    const records = dbService.getExpenses();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(EXPENSES_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },
  deleteExpense: (id) => {
    const records = dbService.getExpenses();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
    return updated;
  },
  updateExpense: (id, updatedRecord) => {
    const records = dbService.getExpenses();
    const updated = records.map(r => r.id === id ? { ...r, ...updatedRecord } : r);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- الصيانة ---
  getMaintenance: () => JSON.parse(localStorage.getItem(MAINTENANCE_KEY)) || [],
  addMaintenance: (record) => {
    const records = dbService.getMaintenance();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },
  deleteMaintenance: (id) => {
    const records = dbService.getMaintenance();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(updated));
    return updated;
  },
  updateMaintenance: (id, updatedRecord) => {
    const records = dbService.getMaintenance();
    const updated = records.map(r => r.id === id ? { ...r, ...updatedRecord } : r);
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- الإحصائيات (محدثة لتعمل حتى مع البيانات القديمة) ---
  getTotals: (carId) => {
    // دالة مساعدة لفلترة السجلات (تتعامل مع البيانات القديمة والجديدة)
    const filterByCar = (records) => {
      if (!carId) return records; // إذا لم يكن هناك سيارة، اجمع الكل (احتياطي)
      return records.filter(r => String(r.carId) === String(carId) || r.carId === undefined);
    };

    const fuel = filterByCar(dbService.getFuelRecords()).reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const maintenance = filterByCar(dbService.getMaintenance()).reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const expenses = filterByCar(dbService.getExpenses()).reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

    return {
      fuel,
      maintenance,
      expenses,
      all: fuel + maintenance + expenses
    };
  }
};
