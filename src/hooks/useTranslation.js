import { useCallback } from 'react';
import { translations } from '../locales/index.js';

export const useTranslation = (lang) => {
  const t = useCallback((key, variables = {}) => {
    let text = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    text = String(text);
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach((varName) => {
        const placeholder = `{${varName}}`;
        if (text.includes(placeholder)) text = text.split(placeholder).join(String(variables[varName] ?? ''));
      });
    }
    return text;
  }, [lang]);

  return { t };
};
