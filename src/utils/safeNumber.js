/**
 * ✅ أدوات التنسيق (التواريخ، العملات، إلخ)
 */

export const formatDate = (dateString, locale = 'ar-MA') => {
  if (!dateString) return '—';
  const dateStr = String(dateString).includes('T') ? dateString : `${dateString}T00:00:00`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  
  return d.toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatCurrency = (amount, currency = 'MAD', locale = 'ar-MA') => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return `0 ${currency}`;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  }).format(num);
};
