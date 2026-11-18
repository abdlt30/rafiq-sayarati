import { createContext, useState, useEffect, useCallback, useContext } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => { try { const saved = localStorage.getItem('theme'); return saved === 'light' || saved === 'dark' ? saved : 'dark'; } catch { return 'dark'; } });
  const [lang, setLang] = useState(() => { try { const saved = localStorage.getItem('lang'); return ['ar', 'en', 'fr'].includes(saved) ? saved : 'ar'; } catch { return 'ar'; } });
  const [currency, setCurrencyRaw] = useState(() => { try { const saved = localStorage.getItem('currency'); return saved && /^[A-Z]{3}$/.test(saved) ? saved : 'MAD'; } catch { return 'MAD'; } });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const changeLang = useCallback((newLang) => { if (['ar', 'en', 'fr'].includes(newLang)) setLang(newLang); }, []);
  const setCurrency = useCallback((newCurrency) => { if (typeof newCurrency === 'string' && /^[A-Z]{3}$/.test(newCurrency.trim())) setCurrencyRaw(newCurrency.trim()); }, []);

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, lang, changeLang, currency, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
