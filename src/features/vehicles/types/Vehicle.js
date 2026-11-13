/**
 * ✅ نموذج بيانات السيارة (Vehicle Model)
 * هذا الملف يوضح شكل البيانات المتوقعة في التطبيق.
 */
export const createVehicleObject = (data = {}) => {
  return {
    id: data.id || crypto.randomUUID(), // معرف فريد
    make: data.make || '',              // الشركة (مثل: تويوتا)
    model: data.model || '',            // الطراز (مثل: كورولا)
    year: data.year || new Date().getFullYear(), // سنة الصنع
    plateNumber: data.plateNumber || '', // رقم اللوحة
    vin: data.vin || '',                // رقم الهيكل (اختياري)
    color: data.color || '',            // اللون
    currentMileage: data.currentMileage || 0, // العداد الحالي
    image: data.image || null,          // صورة السيارة (رابط أو Base64)
    createdAt: data.createdAt || new Date().toISOString(),
  };
};
