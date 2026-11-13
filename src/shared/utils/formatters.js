/**
 * ✅ أدوات التنسيق (التواريخ، العملات، إلخ)
 */

export const formatDate = (dateString, locale = 'ar-MA') => {
  if (!dateString) return '—';

  let d;

  // ✅ تحسين: التعامل مع الأرقام (Timestamps) أو كائنات التاريخ مباشرة
  if (typeof dateString === 'number' || dateString instanceof Date) {
    d = new Date(dateString);
  } else {
    // ✅ الحل العبقري الخاص بك لمنع انزياح التاريخ (Timezone shift)
    const dateStr = String(dateString).includes('T') ? dateString : `${dateString}T00:00:00`;
    d = new Date(dateStr);
  }

  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatCurrency = (amount, currency = 'MAD', locale = 'ar-MA') => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return `0 ${currency}`;
  
  try {
    // ✅ استخدام Intl.NumberFormat (المعيار الذهبي)
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(num);
  } catch (error) {
    // ✅ حماية: إذا كان رمز العملة أو اللغة غير مدعومة، نعود للتنسيق البسيط
    console.warn(`Currency formatting error for ${currency}:`, error);
    return `${num.toFixed(2)} ${currency}`;
  }
};
