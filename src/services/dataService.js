import { db } from '../db/database';

export const getVehicles = async () => {
  return await db.vehicles.toArray();
};

export const addVehicle = async (vehicleData) => {
  return await db.vehicles.add(vehicleData);
};

export const addExpense = async (expense) => {
  return await db.expenses.add(expense);
};

export const getExpensesByVehicle = async (vehicleId) => {
  return await db.expenses.where('vehicleId').equals(vehicleId).toArray();
};
