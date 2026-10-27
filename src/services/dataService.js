import { db } from '../db/database';

export const getVehicles = async () => await db.vehicles.toArray();
export const addVehicle = async (vehicleData) => await db.vehicles.add(vehicleData);

export const addExpense = async (expense) => await db.expenses.add(expense);
export const getExpensesByVehicle = async (vehicleId) => await db.expenses.where('vehicleId').equals(vehicleId).toArray();

// دالة التحديث الجديدة (FUTURE: Replace with Supabase update)
export const updateExpense = async (id, updatedData) => {
  return await db.expenses.update(id, updatedData);
};

// دالة الحذف (اختيارية لكنها ضرورية للمنتج النهائي)
export const deleteExpense = async (id) => {
  return await db.expenses.delete(id);
};

export const addMaintenance = async (data) => await db.maintenance.add(data);
export const getMaintenanceByVehicle = async (vehicleId) => await db.maintenance.where('vehicleId').equals(vehicleId).toArray();
