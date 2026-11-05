import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// قاموس الترجمة الشامل والنهائي
const translations = {
  ar: { 
    home: 'الرئيسية', expenses: 'المصاريف', maintenance: 'الصيانة', documents: 'الوثائق', more: 'المزيد', settings: 'الإعدادات', 
    darkMode: 'الوضع الداكن', language: 'اللغة', total: 'إجمالي المصاريف', costPerKm: 'تكلفة الكيلومتر',
    distributionByType: 'توزيع المصاريف', quickActions: 'إجراءات سريعة', addFuel: 'إضافة وقود',
    addMaintenance: 'إضافة صيانة', addExpense: 'إضافة مصروف', noVehicles: 'لا توجد سيارة مسجلة.',
    noData: 'لا توجد بيانات كافية', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
    confirmDelete: 'هل أنت متأكد من الحذف؟', noDocuments: 'لا توجد وثائق', addDocument: 'إضافة وثيقة',
    expired: 'منتهية', valid: 'صالحة', expiringSoon: 'تنتهي قريباً', endsOn: 'ينتهي في',
    totalRecords: 'إجمالي السجلات', oilChanges: 'تغيير زيت', fuelLog: 'سجل الوقود', date: 'التاريخ',
    amount: 'المبلغ', type: 'النوع', notes: 'ملاحظات', appName: 'DriveLife'
  },
  en: { 
    home: 'Home', expenses: 'Expenses', maintenance: 'Maintenance', documents: 'Documents', more: 'More', settings: 'Settings', 
    darkMode: 'Dark Mode', language: 'Language', total: 'Total Expenses', costPerKm: 'Cost per KM',
    distributionByType: 'Expense Distribution', quickActions: 'Quick Actions', addFuel: 'Add Fuel',
    addMaintenance: 'Add Maintenance', addExpense: 'Add Expense', noVehicles: 'No vehicle registered.',
    noData: 'Not enough data', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    confirmDelete: 'Are you sure you want to delete?', noDocuments: 'No documents', addDocument: 'Add Document',
    expired: 'Expired', valid: 'Valid', expiringSoon: 'Expiring Soon', endsOn: 'Ends on',
    totalRecords: 'Total Records', oilChanges: 'Oil Changes', fuelLog: 'Fuel Log', date: 'Date',
    amount: 'Amount', type: 'Type', notes: 'Notes', appName: 'DriveLife'
  },
  fr: { 
    home: 'Accueil', expenses: 'Dépenses', maintenance: 'Entretien', documents: 'Documents', more: 'Plus', settings: 'Paramètres', 
    darkMode: 'Mode Sombre', language: 'Langue', total: 'Dépenses Totales', costPerKm: 'Coût par KM',
    distributionByType: 'Répartition des Dépenses', quickActions: 'Actions Rapides', addFuel: 'Ajouter Carburant',
    addMaintenance: 'Ajouter Entretien', addExpense: 'Ajouter Dépense', noVehicles: 'Aucun véhicule enregistré.',
    noData: 'Pas assez de données', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer?', noDocuments: 'Aucun document', addDocument: 'Ajouter Document',
    expired: 'Expiré', valid: 'Valide', expiringSoon: 'Expire bientôt', endsOn: 'Se termine le',
    totalRecords: 'Total des Enregistrements', oilChanges: 'Vidanges', fuelLog: 'Journal de Carburant', date: 'Date',
    amount: 'Montant', type: 'Type', notes: 'Notes', appName: 'DriveLife'
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
