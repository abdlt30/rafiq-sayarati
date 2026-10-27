import { db } from '../db/database';

export const getVehicles = async () => await db.vehicles.toArray();

export const addVehicle = async (vehicleData) => await db.vehicles.add(vehicleData);

export const addExpense = async (expense) => await db.expenses.add(expense);

export const getExpensesByVehicle = async (vehicleId) => await db.expenses.where('vehicleId').equals(vehicleId).toArray();

// دوال الصيانة الجديدة
export const addMaintenance = async (data) => await db.maintenance.add(data);
export const getMaintenanceByVehicle = async (vehicleId) => await db.maintenance.where('vehicleId').equals(vehicleId).toArray();
