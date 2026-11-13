/**
 * ✅ دالة مساعدة لتحويل القيم إلى أرقام بأمان (Safe Number)
 * تمنع ظهور NaN أو Infinity في التطبيق، وتتخلص من الفواصل والمسافات.
 * 
 * @param {any} value - القيمة المراد تحويلها (نص، رقم، null...)
 * @param {number} fallback - القيمة الافتراضية في حال كان التحويل مستحيلاً (افتراضياً 0)
 * @returns {number} - رقم آمن وجاهز للعمليات الحسابية
 */
export const safeNumber = (value, fallback = 0) => {
  // 1. التحقق من القيم الفارغة أو غير المعرفة
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  // 2. إذا كانت القيمة رقم بالفعل
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  // 3. معالجة النصوص (إزالة المسافات والفواصل النصية مثل "1,500.50")
  if (typeof value === 'string') {
    // إزالة المسافات والفواصل (مثل الفاصلة التي يضعها المستخدم عند كتابة الألاف)
    const cleanedString = value.trim().replace(/,/g, '');
    
    // تحويل النص إلى رقم
    const parsedNumber = Number(cleanedString);
    
    // التأكد من أن النتيجة رقم حقيقي وليس NaN أو Infinity
    return Number.isFinite(parsedNumber) ? parsedNumber : fallback;
  }

  // 4. أي نوع آخر (مثل Boolean أو Object) يعود للقيمة الافتراضية
  return fallback;
};
