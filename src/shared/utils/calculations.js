import { safeNumber } from './safeNumber';

/**
 * ✅ حساب متوسط استهلاك الوقود (لتر/100كم أو كيلوواط/100كم)
 * تعتمد هذه الدالة على طريقة (الخزان إلى الخزان)
 * يتم قسمة كمية الوقود المضاف على المسافة المقطوعة منذ آخر تعبئة.
 */
export const calculateConsumption = (records) => {
  // نحتاج على الأقل سجلين لحساب المسافة
  if (!records || records.length < 2) return null;

  // 1. معالجة البيانات: تحويل العداد لرقم، تصفية القيم الصفرية، والترتيب تصاعدياً
  const normalized = records
    .map(r => ({ ...r, _odo: safeNumber(r.odometer) }))
    .filter(r => r._odo > 0)
    .sort((a, b) => a._odo - b._odo);

  let totalAmount = 0;
  let totalDistance = 0;

  // 2. الحساب التراكمي للمسافات والوقود
  for (let i = 1; i < normalized.length; i++) {
    // المسافة المقطوعة بين السجل الحالي والسجل السابق
    const dist = normalized[i]._odo - normalized[i - 1]._odo;
    // كمية الوقود المضاف في السجل الحالي
    const amount = safeNumber(normalized[i].amount ?? normalized[i].liters);
    
    // التأكد من أن المسافة والكمية أرقام موجبة
    if (dist > 0 && amount > 0) {
      totalDistance += dist;
      totalAmount += amount;
    }
  }

  // 3. حماية من القسمة على صفر
  if (totalDistance <= 0 || totalAmount <= 0) return null;

  // 4. المعادلة الرياضية: (إجمالي الوقود / إجمالي المسافة) * 100
  const consumption = (totalAmount / totalDistance) * 100;
  
  // إرجاع النتيجة كرقم عشري واحد
  return Number(consumption.toFixed(1));
};
