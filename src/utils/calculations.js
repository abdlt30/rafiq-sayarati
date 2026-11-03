// حساب تكلفة الكيلومتر
export const calculateCostPerKm = (totalExpenses, initialOdometer, currentOdometer) => {
  const distance = currentOdometer - initialOdometer;
  if (distance <= 0) return 0;
  return (totalExpenses / distance).toFixed(2);
};

// حساب متوسط استهلاك الوقود (L/100km)
export const calculateFuelConsumption = (fuelRecords) => {
  if (fuelRecords.length < 2) return 0;
  
  // نأخذ آخر سجلين
  const sorted = fuelRecords.sort((a, b) => b.odometer - a.odometer);
  const latest = sorted[0];
  const previous = sorted[1];
  
  const distance = latest.odometer - previous.odometer;
  if (distance <= 0) return 0;
  
  return ((latest.liters / distance) * 100).toFixed(2);
};
