import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// قاموس الترجمة
const translations = {
  ar: { home: 'الرئيسية', expenses: 'المصاريف', maintenance: 'الصيانة', documents: 'الوثائق', more: 'المزيد', settings: 'الإعدادات', darkMode: 'الوضع الداكن', language: 'اللغة' },
  en: { home: 'Home', expenses: 'Expenses', maintenance: 'Maintenance', documents: 'Documents', more: 'More', settings: 'Settings', darkMode: 'Dark Mode', language: 'Language' },
  fr: { home: 'Accueil', expenses: 'Dépenses', maintenance: 'Entretien', documents: 'Documents', more: 'Plus', settings: 'Paramètres', darkMode: 'Mode Sombre', language: 'Langue' }
};

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');

  useEffect(() => {
    const savedCar = JSON.parse(localStorage.getItem('savedCar'));
    if (savedCar) setCurrentCar(savedCar);
    setIsLoading(false);
  }, []);

  // تحديث المظهر واللغة
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', lang);
  }, [theme, lang]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const changeLang = (newLang) => setLang(newLang);

  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now().toString() };
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    setCurrentCar(newCar);
  };

  // دالة الترجمة
  const t = (key) => translations[lang]?.[key] || key;

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading, theme, toggleTheme, lang, changeLang, t }}>
      {children}
    </AppContext.Provider>
  );
};
