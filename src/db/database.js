import Dexie from 'dexie';

export const db = new Dexie('RafiqSayaratiDB');

db.version(1).stores({
  vehicles: '++id, name, odometer, plate',
  expenses: '++id, vehicleId, type, amount, date, odometer',
  maintenance: '++id, vehicleId, service, date, odometer',
  documents: '++id, vehicleId, type, endDate',
  fuel: '++id, vehicleId, date, odometer, liters, cost, fullTank' // <-- أضف هذا السطر
});

export const initDB = async () => {
  const count = await db.vehicles.count();
  if (count === 0) {
    await db.vehicles.add({
      name: 'تويوتا كورولا 2021',
      brand: 'Toyota',
      model: 'Corolla',
      odometer: 92350,
      plate: '12345 - أ - 6',
      year: 2021
    });
  }
};
