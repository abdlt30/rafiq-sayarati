import { db } from '../db/database';

// 1. السيارات
export const getVehicles = async () => await db.vehicles.toArray();
export const addVehicle = async (vehicleData) => await db.vehicles.add(vehicleData);

// 2. المصاريف
export const addExpense = async (expense) => await db.expenses.add(expense);
export const getExpensesByVehicle = async (vehicleId) => await db.expenses.where('vehicleId').equals(vehicleId).toArray();
export const updateExpense = async (id, updatedData) => await db.expenses.update(id, updatedData);
export const deleteExpense = async (id) => await db.expenses.delete(id);

// 3. الصيانة
export const addMaintenance = async (data) => await db.maintenance.add(data);
export const getMaintenanceByVehicle = async (vehicleId) => await db.maintenance.where('vehicleId').equals(vehicleId).toArray();
export const updateMaintenance = async (id, updatedData) => await db.maintenance.update(id, updatedData);
export const deleteMaintenance = async (id) => await db.maintenance.delete(id);

// 4. الوثائق
export const addDocument = async (data) => await db.documents.add(data);
export const getDocumentsByVehicle = async (vehicleId) => await db.documents.where('vehicleId').equals(vehicleId).toArray();
export const deleteDocument = async (id) => await db.documents.delete(id);

// 5. الوقود (الدوال التي كانت مفقودة)
export const addFuelLog = async (data) => await db.fuel.add(data);
export const getFuelLogsByVehicle = async (vehicleId) => await db.fuel.where('vehicleId').equals(vehicleId).toArray();
export const deleteFuelLog = async (id) => await db.fuel.delete(id);
