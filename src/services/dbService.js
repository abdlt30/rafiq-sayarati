const FUEL_KEY = 'fuel_records';
const EXPENSES_KEY = 'expenses_records';
const MAINTENANCE_KEY = 'maintenance_records';
const DOCUMENTS_KEY = 'documents_records';
const REMINDERS_KEY = 'reminders_records';

export const dbService = {
  // --- الوقود ---
  getFuel: () => JSON.parse(localStorage.getItem(FUEL_KEY)) || [],
  addFuel: (record) => {
    const records = dbService.getFuel();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(FUEL_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },
  deleteFuel: (id) => {
    const updated = dbService.getFuel().filter(r => r.id !== id);
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
    const updated = dbService.getExpenses().filter(r => r.id !== id);
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
    const updated = dbService.getMaintenance().filter(r => r.id !== id);
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- الوثائق (جديد) ---
  getDocuments: () => JSON.parse(localStorage.getItem(DOCUMENTS_KEY)) || [],
  addDocument: (record) => {
    const records = dbService.getDocuments();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },
  deleteDocument: (id) => {
    const updated = dbService.getDocuments().filter(r => r.id !== id);
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- التذكيرات (جديد) ---
  getReminders: () => JSON.parse(localStorage.getItem(REMINDERS_KEY)) || [],
  addReminder: (record) => {
    const records = dbService.getReminders();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(REMINDERS_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },
  deleteReminder: (id) => {
    const updated = dbService.getReminders().filter(r => r.id !== id);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- الإحصائيات العامة ---
  getTotals: (carId) => {
    const filterByCar = (records) => records.filter(r => String(r.carId) === String(carId) || r.carId === undefined);
    
    const fuel = filterByCar(dbService.getFuel()).reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const maintenance = filterByCar(dbService.getMaintenance()).reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const expenses = filterByCar(dbService.getExpenses()).reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const totalLiters = filterByCar(dbService.getFuel()).reduce((sum, r) => sum + (Number(r.liters) || 0), 0);

    return { fuel, maintenance, expenses, total: fuel + maintenance + expenses, totalLiters };
  }
  const REMINDERS_KEY = 'reminders_records';

// داخل dbService:
  getReminders: () => JSON.parse(localStorage.getItem(REMINDERS_KEY)) || [],
  addReminder: (record) => {
    const records = dbService.getReminders();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(REMINDERS_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },
  deleteReminder: (id) => {
    const updated = dbService.getReminders().filter(r => r.id !== id);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
    return updated;
  },
  updateReminder: (id, updatedRecord) => {
    const updated = dbService.getReminders().map(r => r.id === id ? { ...r, ...updatedRecord } : r);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
    return updated;
  },
};
