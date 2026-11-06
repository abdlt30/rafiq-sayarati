import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const translations = {
  ar: { 
    home: 'الرئيسية', expenses: 'المصاريف', maintenance: 'الصيانة', documents: 'الوثائق', more: 'المزيد', settings: 'الإعدادات', 
    darkMode: 'الوضع الداكن', language: 'اللغة', totalCost: 'إجمالي المصاريف', costPerKm: 'تكلفة الكيلومتر',
    distributionByType: 'توزيع المصاريف', quickActions: 'إجراءات سريعة', addFuel: 'إضافة وقود',
    addMaintenance: 'إضافة صيانة', addExpense: 'إضافة مصروف', addDocument: 'إضافة وثيقة', noVehicles: 'لا توجد سيارة مسجلة.',
    noData: 'لا توجد بيانات كافية', save: 'حفظ', cancel: 'إلغاء', welcome: 'مرحباً،', 
    month: 'هذا الشهر', distance: 'المسافة المقطوعة', nextMaintenance: 'الصيانة القادمة', 
    expiringDocs: 'وثائق تنتهي قريباً', recentActivity: 'آخر العمليات', viewAll: 'عرض الكل',
    switchCar: 'تغيير السيارة', addNewCar: 'إضافة سيارة', goodCondition: 'حالة جيدة'
  },
  en: { 
    home: 'Home', expenses: 'Expenses', maintenance: 'Maintenance', documents: 'Documents', more: 'More', settings: 'Settings', 
    darkMode: 'Dark Mode', language: 'Language', totalCost: 'Total Cost', costPerKm: 'Cost per KM',
    distributionByType: 'Expense Distribution', quickActions: 'Quick Actions', addFuel: 'Add Fuel',
    addMaintenance: 'Add Maintenance', addExpense: 'Add Expense', addDocument: 'Add Document', noVehicles: 'No vehicle registered.',
    noData: 'Not enough data', save: 'Save', cancel: 'Cancel', welcome: 'Welcome,', 
    month: 'This Month', distance: 'Total Distance', nextMaintenance: 'Next Maintenance', 
    expiringDocs: 'Expiring Documents', recentActivity: 'Recent Activity', viewAll: 'View All',
    switchCar: 'Switch Car', addNewCar: 'Add Vehicle', goodCondition: 'Good Condition'
  },
  fr: { 
    home: 'Accueil', expenses: 'Dépenses', maintenance: 'Entretien', documents: 'Documents', more: 'Plus', settings: 'Paramètres', 
    darkMode: 'Mode Sombre', language: 'Langue', totalCost: 'Coût Total', costPerKm: 'Coût par KM',
    distributionByType: 'Répartition des Dépenses', quickActions: 'Actions Rapides', addFuel: 'Ajouter Carburant',
    addMaintenance: 'Ajouter Entretien', addExpense: 'Ajouter Dépense', addDocument: 'Ajouter Document', noVehicles: 'Aucun véhicule enregistré.',
    noData: 'Pas assez de données', save: 'Enregistrer', cancel: 'Annuler', welcome: 'Bienvenue,', 
    month: 'Ce Mois', distance: 'Distance Totale', nextMaintenance: 'Prochain Entretien', 
    expiringDocs: 'Documents Expirants', recentActivity: 'Activité Récente', viewAll: 'Voir Tout',
    switchCar: 'Changer de Voiture', addNewCar: 'Ajouter Véhicule', goodCondition: 'Bon État'
  }
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
  const t = (key) => translations[lang]?.[key] || key;

  return (
    <AppContext.Provider value={{ currentCar, addNewCar, isLoading, theme, toggleTheme, lang, changeLang, t }}>
      {children}
    </AppContext.Provider>
  );
};
