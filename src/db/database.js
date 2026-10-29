import Dexie from 'dexie';

export const db = new Dexie('RafiqSayaratiDB');

// تعريف الجداول بناءً على المخطط
db.version(1).stores({
  cars: '++id, make, model, year, plate, currentOdometer', // جدول السيارات
  fuelRecords: '++id, carId, date, odometer, liters, cost, isFullTank', // جدول الوقود
  maintenance: '++id, carId, date, type, cost, odometer, notes', // جدول الصيانة
  expenses: '++id, carId, date, category, amount, notes' // جدول المصاريف
});
