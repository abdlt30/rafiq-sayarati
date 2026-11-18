export const validateOdometer = (input, { required = false } = {}) => {
  if (input === undefined || input === null || String(input).trim() === '') {
    return required ? { valid: false } : { valid: true, value: 0 };
  }
  const num = Number(String(input).trim());
  if (!Number.isFinite(num) || num < 0) return { valid: false };
  return { valid: true, value: Math.round(num) };
};
