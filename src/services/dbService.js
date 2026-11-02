const FUEL_KEY = 'fuel_records';
const EXPENSES_KEY = 'expenses_records';

export const dbService = {
  // --- الوقود ---
  getFuelRecords: () => {
    const data = localStorage.getItem(FUEL_KEY);
    return data ? JSON.parse(data) : [];
  },
  addFuelRecord: (record) => {
    const records = dbService.getFuelRecords();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(FUEL_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  },

  // --- المصاريف ---
  getExpenses: () => {
    const data = localStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  },
  addExpense: (record) => {
    const records = dbService.getExpenses();
    const newRecord = { ...record, id: Date.now() };
    localStorage.setItem(EXPENSES_KEY, JSON.stringify([newRecord, ...records]));
    return newRecord;
  }
};
