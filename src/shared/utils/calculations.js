import { safeNumber } from './safeNumber';

/**
 * ✅ حساب متوسط استهلاك الوقود (لتر/100كم أو كيلوواط/100كم)
 */
export const calculateConsumption = (records) => {
  if (!records || records.length < 2) return null;

  const normalized = records
    .map(r => ({ ...r, _odo: safeNumber(r.odometer) }))
    .filter(r => r._odo > 0)
    .sort((a, b) => a._odo - b._odo);

  let totalAmount = 0;
  let totalDistance = 0;

  for (let i = 1; i < normalized.length; i++) {
    const dist = normalized[i]._odo - normalized[i - 1]._odo;
    const amount = safeNumber(normalized[i].amount ?? normalized[i].liters);
    
    if (dist > 0 && amount > 0) {
      totalDistance += dist;
      totalAmount += amount;
    }
  }

  if (totalDistance <= 0) return null;
  return Number(((totalAmount / totalDistance) * 100).toFixed(1));
};

