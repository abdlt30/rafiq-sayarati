import Dexie from 'dexie';

// إنشاء قاعدة البيانات
export const db = new Dexie('RafiqSayaratiDB');

db.version(1).stores({
  cars: '++id, make, model, year, plate, currentOdometer',
  fuelRecords: '++id, carId, date, odometer, liters, cost, isFullTank',
  maintenance: '++id, carId, date, type, cost, odometer, notes',
  expenses: '++id, carId, date, category, amount, notes'
});
