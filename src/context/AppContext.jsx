import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const translations = {
  ar: { 
    // عام
    home: 'الرئيسية', expenses: 'المصاريف', maintenance: 'الصيانة', documents: 'الوثائق', more: 'المزيد', settings: 'الإعدادات', 
    save: 'حفظ', cancel: 'إلغاء', welcome: 'مرحباً،', edit: 'تعديل', confirmDelete: 'هل أنت متأكد من الحذف؟',
    month: 'هذا الشهر', viewAll: 'عرض الكل', noData: 'لا توجد بيانات كافية',
    
    // الإعدادات والمظهر
    darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح', language: 'اللغة', currency: 'العملة',
    
    // لوحة التحكم (Dashboard)
    totalCost: 'إجمالي المصاريف', costPerKm: 'تكلفة الكيلومتر', distributionByType: 'توزيع المصاريف', 
    quickActions: 'إجراءات سريعة', distance: 'المسافة المقطوعة', nextMaintenance: 'الصيانة القادمة', 
    expiringDocs: 'وثائق تنتهي قريباً', recentActivity: 'آخر العمليات',
    
    // السيارات
    vehicles: 'سياراتي', carInfo: 'معلومات السيارة', switchCar: 'تغيير السيارة', addNewCar: 'إضافة سيارة', 
    noVehicles: 'لا توجد سيارة مسجلة.', fillRequiredFields: 'الرجاء تعبئة الحقول الأساسية', 
    addYourCar: 'أضف سيارتك', addYourCarSubtitle: 'أدخل بيانات سيارتك الأولى لنبدأ التتبع.', 
    carMake: 'الماركة (مثال: تويوتا)', carModel: 'الموديل (مثال: كورولا)', plateNumber: 'رقم اللوحة (اختياري)', 
    currentOdometer: 'عداد السيارة الحالي (KM)', saveAndContinue: 'حفظ ومتابعة',
    
    // صفحة الترحيب
    appName: 'رفيق سيارتي', welcomeMessagePart1: 'تحكم في مصاريف سيارتك، تابع صيانتها، ووفر', 
    welcomeMessagePart2: 'من ميزانيتك بذكاء.', startNow: 'ابدأ الآن',

    // المصاريف (Expenses)
    expenseType: 'نوع المصروف', amount: 'المبلغ', enterAmount: 'أدخل المبلغ', addExpense: 'إضافة مصروف',
    insurance: 'تأمين', taxes: 'ضرائب', carWash: 'غسيل', fines: 'مخالفات مرورية', parking: 'رسوم مواقف', other: 'أخرى',
    
    // الوقود (Fuel)
    fuel: 'سجل الوقود', addFuel: 'إضافة وقود', odometer: 'العداد', liters: 'اللترات', 
    cost: 'التكلفة', noFuelRecords: 'لا توجد سجلات وقود.', date: 'التاريخ',
    
    // الصيانة (Maintenance)
    addMaintenance: 'إضافة صيانة', maintenanceType: 'نوع الصيانة', oilChange: 'تغيير زيت', tires: 'إطارات', 
    brakes: 'فرامل', battery: 'بطارية', airFilter: 'فلتر هواء', fullInspection: 'فحص شامل',
    nextOdometer: 'العداد للصيانة القادمة', enterCost: 'أدخل التكلفة', optional: 'اختياري',
    noMaintenanceRecords: 'لا توجد سجلات صيانة.', nextChange: 'التغيير القادم', noNextMaintenance: 'لا توجد صيانة قادمة',
    
    // الوثائق (Documents)
    addDocument: 'إضافة وثيقة', documentType: 'نوع الوثيقة', endDate: 'تاريخ الانتهاء', 
    technicalInspection: 'فحص تقني', license: 'رخصة', expired: 'منتهية', 
    expiringSoon: 'تنتهي قريباً', valid: 'صالح', endsOn: 'ينتهي في', noDocuments: 'لا توجد وثائق مسجلة.'
  },
  en: { 
    // General
    home: 'Home', expenses: 'Expenses', maintenance: 'Maintenance', documents: 'Documents', more: 'More', settings: 'Settings', 
    save: 'Save', cancel: 'Cancel', welcome: 'Welcome,', edit: 'Edit', confirmDelete: 'Are you sure you want to delete?',
    month: 'This Month', viewAll: 'View All', noData: 'Not enough data',
    
    // Settings & Theme
    darkMode: 'Dark Mode', lightMode: 'Light Mode', language: 'Language', currency: 'Currency',
    
    // Dashboard
    totalCost: 'Total Cost', costPerKm: 'Cost per KM', distributionByType: 'Expense Distribution', 
    quickActions: 'Quick Actions', distance: 'Total Distance', nextMaintenance: 'Next Maintenance', 
    expiringDocs: 'Expiring Documents', recentActivity: 'Recent Activity',
    
    // Vehicles
    vehicles: 'My Vehicles', carInfo: 'Car Information', switchCar: 'Switch Car', addNewCar: 'Add Vehicle', 
    noVehicles: 'No vehicle registered.', fillRequiredFields: 'Please fill in the required fields', 
    addYourCar: 'Add Your Car', addYourCarSubtitle: 'Enter your first car details to start tracking.', 
    carMake: 'Make (e.g., Toyota)', carModel: 'Model (e.g., Corolla)', plateNumber: 'Plate Number (Optional)', 
    currentOdometer: 'Current Odometer (KM)', saveAndContinue: 'Save and Continue',
    
    // Welcome Page
    appName: 'My Car Companion', welcomeMessagePart1: 'Control your car expenses, track maintenance, and save', 
    welcomeMessagePart2: 'of your budget smartly.', startNow: 'Start Now',

    // Expenses
    expenseType: 'Expense Type', amount: 'Amount', enterAmount: 'Enter amount', addExpense: 'Add Expense',
    insurance: 'Insurance', taxes: 'Taxes', carWash: 'Car Wash', fines: 'Traffic Fines', parking: 'Parking', other: 'Other',
    
    // Fuel
    fuel: 'Fuel Log', addFuel: 'Add Fuel', odometer: 'Odometer', liters: 'Liters', 
    cost: 'Cost', noFuelRecords: 'No fuel records found.', date: 'Date',
    
    // Maintenance
    addMaintenance: 'Add Maintenance', maintenanceType: 'Maintenance Type', oilChange: 'Oil Change', tires: 'Tires', 
    brakes: 'Brakes', battery: 'Battery', airFilter: 'Air Filter', fullInspection: 'Full Inspection',
    nextOdometer: 'Next Maintenance Odometer', enterCost: 'Enter cost', optional: 'Optional',
    noMaintenanceRecords: 'No maintenance records.', nextChange: 'Next change', noNextMaintenance: 'No next maintenance',
    
    // Documents
    addDocument: 'Add Document', documentType: 'Document Type', endDate: 'End Date', 
    technicalInspection: 'Technical Inspection', license: 'License', expired: 'Expired', 
    expiringSoon: 'Expiring Soon', valid: 'Valid', endsOn: 'Ends on', noDocuments: 'No documents registered.'
  },
  fr: { 
    // Général
    home: 'Accueil', expenses: 'Dépenses', maintenance: 'Entretien', documents: 'Documents', more: 'Plus', settings: 'Paramètres', 
    save: 'Enregistrer', cancel: 'Annuler', welcome: 'Bienvenue,', edit: 'Modifier', confirmDelete: 'Êtes-vous sûr de vouloir supprimer?',
    month: 'Ce Mois', viewAll: 'Voir Tout', noData: 'Pas assez de données',
    
    // Paramètres & Thème
    darkMode: 'Mode Sombre', lightMode: 'Mode Clair', language: 'Langue', currency: 'Devise',
    
    // Tableau de bord
    totalCost: 'Coût Total', costPerKm: 'Coût par KM', distributionByType: 'Répartition des Dépenses', 
    quickActions: 'Actions Rapides', distance: 'Distance Totale', nextMaintenance: 'Prochain Entretien', 
    expiringDocs: 'Documents Expirants', recentActivity: 'Activité Récente',
    
    // Véhicules
    vehicles: 'Mes Véhicules', carInfo: 'Informations du Véhicule', switchCar: 'Changer de Voiture', addNewCar: 'Ajouter Véhicule', 
    noVehicles: 'Aucun véhicule enregistré.', fillRequiredFields: 'Veuillez remplir les champs obligatoires', 
    addYourCar: 'Ajoutez votre voiture', addYourCarSubtitle: 'Entrez les détails de votre première voiture pour commencer le suivi.', 
    carMake: 'Marque (ex: Toyota)', carModel: 'Modèle (ex: Corolla)', plateNumber: 'Numéro de plaque (Optionnel)', 
    currentOdometer: 'Compteur actuel (KM)', saveAndContinue: 'Enregistrer et Continuer',
    
    // Page d'accueil
    appName: 'Mon Compagnon Auto', welcomeMessagePart1: 'Contrôlez les dépenses de votre voiture, suivez son entretien et économisez', 
    welcomeMessagePart2: 'de votre budget intelligemment.', startNow: 'Commencer',

    // Dépenses
    expenseType: 'Type de dépense', amount: 'Montant', enterAmount: 'Entrer le montant', addExpense: 'Ajouter Dépense',
    insurance: 'Assurance', taxes: 'Impôts', carWash: 'Lavage', fines: 'Amendes', parking: 'Stationnement', other: 'Autre',
    
    // Carburant
    fuel: 'Journal de Carburant', addFuel: 'Ajouter Carburant', odometer: 'Compteur Kilométrique', liters: 'Litres', 
    cost: 'Coût', noFuelRecords: 'Aucun enregistrement de carburant.', date: 'Date',
    
    // Entretien
    addMaintenance: 'Ajouter Entretien', maintenanceType: 'Type d\'entretien', oilChange: 'Vidange d\'huile', tires: 'Pneus', 
    brakes: 'Freins', battery: 'Batterie', airFilter: 'Filtre à air', fullInspection: 'Inspection complète',
    nextOdometer: 'Compteur pour le prochain entretien', enterCost: 'Entrer le coût', optional: 'Optionnel',
    noMaintenanceRecords: 'Aucun enregistrement d\'entretien.', nextChange: 'Prochain changement', noNextMaintenance: 'Pas de prochain entretien',
    
    // Documents
    addDocument: 'Ajouter Document', documentType: 'Type de document', endDate: 'Date d\'expiration', 
    technicalInspection: 'Contrôle technique', license: 'Permis', expired: 'Expiré', 
    expiringSoon: 'Expire bientôt', valid: 'Valide', endsOn: 'Expire le', noDocuments: 'Aucun document enregistré.'
  }
};

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'MAD');

  useEffect(() => {
    const savedCar = JSON.parse(localStorage.getItem('savedCar'));
    const savedVehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
    if (savedCar) setCurrentCar(savedCar);
    setVehicles(savedVehicles);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', lang);
    localStorage.setItem('currency', currency);
  }, [theme, lang, currency]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const changeLang = (newLang) => setLang(newLang);
  
  const addNewCar = (carData) => {
    const newCar = { ...carData, id: Date.now().toString() };
    const updatedVehicles = [...vehicles, newCar];
    
    localStorage.setItem('savedCar', JSON.stringify(newCar));
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    
    setCurrentCar(newCar);
    setVehicles(updatedVehicles);
  };

  const selectCar = (car) => {
    localStorage.setItem('savedCar', JSON.stringify(car));
    setCurrentCar(car);
  };

  const t = (key) => translations[lang]?.[key] || key;

  return (
    <AppContext.Provider value={{ 
      currentCar, vehicles, addNewCar, selectCar, 
      isLoading, theme, toggleTheme, lang, changeLang, currency, setCurrency, t 
    }}>
      {children}
    </AppContext.Provider>
  );
};
