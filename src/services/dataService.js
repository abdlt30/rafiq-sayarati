import { db } from '../db/database';

// ==========================================
// 1. إدارة السيارات (Vehicles)
// ==========================================
export const getVehicles = async () => await db.vehicles.toArray();
export const addVehicle = async (vehicleData) => await db.vehicles.add(vehicleData);

// ==========================================
// 2. إدارة المصاريف (Expenses)
// ==========================================
export const addExpense = async (expense) => await db.expenses.add(expense);
export const getExpensesByVehicle = async (vehicleId) => await db.expenses.where('vehicleId').equals(vehicleId).toArray();

// (FUTURE: Replace with Supabase update)
export const updateExpense = async (id, updatedData) => {
  return await db.expenses.update(id, updatedData);
};

export const deleteExpense = async (id) => {
  return await db.expenses.delete(id);
};

// ==========================================
// 3. إدارة الصيانة (Maintenance)
// ==========================================
export const addMaintenance = async (data) => await db.maintenance.add(data);
export const getMaintenanceByVehicle = async (vehicleId) => await db.maintenance.where('vehicleId').equals(vehicleId).toArray();

// الدوال الجديدة التي كانت ناقصة
export const updateMaintenance = async (id, updatedData) => {
  return await db.maintenance.update(id, updatedData);
};

export const deleteMaintenance = async (id) => {
  return await db.maintenance.delete(id);
};

// ==========================================
// 4. إدارة الوثائق (Documents) - للمستقبل القريب
// ==========================================
export const addDocument = async (data) => await db.documents.add(data);
export const getDocumentsByVehicle = async (vehicleId) => await db.documents.where('vehicleId').equals(vehicleId).toArray();
