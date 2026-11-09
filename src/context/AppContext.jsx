import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const translations = {
  ar: { 
    home: 'الرئيسية', expenses: 'المصاريف', maintenance: 'الصيانة', documents: 'الوثائق', more: 'المزيد', settings: 'الإعدادات', 
    save: 'حفظ', cancel: 'إلغاء', welcome: 'مرحباً،', edit: 'تعديل', confirmDelete: 'هل أنت متأكد من الحذف؟',
    confirmDeleteCar: 'هل أنت متأكد من حذف هذه السيارة؟',
    month: 'هذا الشهر', viewAll: 'عرض الكل', noData: 'لا توجد بيانات كافية',
    darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح', language: 'اللغة', currency: 'العملة',
    totalCost: 'إجمالي المصاريف', costPerKm: 'تكلفة الكيلومتر', distributionByType: 'توزيع المصاريف', 
    quickActions: 'إجراءات سريعة', distance: 'المسافة المقطوعة', nextMaintenance: 'الصيانة القادمة', 
    expiringDocs: 'وثائق تنتهي قريباً', recentActivity: 'آخر العمليات',
    currentCar: 'السيارة الحالية', monthlyCost: 'مصاريف الشهر', 
    upcomingMaintenance: 'الصيانة القادمة', expense: 'مصروف', upcomingAlerts: 'تنبيهات هامة',
    vehicles: 'سياراتي', carInfo: 'معلومات السيارة', switchCar: 'تغيير السيارة', addNewCar: 'إضافة سيارة', 
    noVehicles: 'لا توجد سيارة مسجلة.', noVehiclesAdded: 'لا توجد سيارات مضافة. اضغط على زر (+) لإضافة سيارة.',
    fillRequiredFields: 'الرجاء تعبئة الحقول الأساسية', addYourCar: 'أضف سيارتك', 
    addYourCarSubtitle: 'أدخل بيانات سيارتك الأولى لنبدأ التتبع.', carMake: 'الماركة (مثال: تويوتا)', 
    carModel: 'الموديل (مثال: كورولا)', plateNumber: 'رقم اللوحة (اختياري)', 
    currentOdometer: 'عداد السيارة الحالي (KM)', saveAndContinue: 'حفظ ومتابعة',
    editCar: 'تعديل السيارة', editCarSubtitle: 'قم بتحديث بيانات سيارتك.',
    carYear: 'سنة الصنع (اختياري)', carColor: 'اللون (اختياري)',
    appName: 'رفيق سيارتي', welcomeMessagePart1: 'تحكم في مصاريف سيارتك، تابع صيانتها، ووفر', 
    welcomeMessagePart2: 'من ميزانيتك بذكاء.', startNow: 'ابدأ الآن',
    expenseType: 'نوع المصروف', amount: 'المبلغ', enterAmount: 'أدخل المبلغ', addExpense: 'إضافة مصروف',
    noExpenses: 'لا توجد مصاريف مسجلة.', insurance: 'تأمين', taxes: 'ضرائب', carWash: 'غسيل', fines: 'مخالفات مرورية', parking: 'رسوم مواقف', other: 'أخرى',
    fuel: 'سجل الوقود', addFuel: 'إضافة وقود', odometer: 'العداد', liters: 'اللترات', 
    cost: 'التكلفة', noFuelRecords: 'لا توجد سجلات وقود.', date: 'التاريخ',
    addMaintenance: 'إضافة صيانة', maintenanceType: 'نوع الصيانة', oilChange: 'تغيير زيت', tires: 'إطارات', 
    brakes: 'فرامل', battery: 'بطارية', airFilter: 'فلتر هواء', fullInspection: 'فحص شامل',
    nextOdometer: 'العداد للصيانة القادمة', enterCost: 'أدخل التكلفة', optional: 'اختياري',
    noMaintenanceRecords: 'لا توجد سجلات صيانة.', nextChange: 'التغيير القادم', noNextMaintenance: 'لا توجد صيانة قادمة',
    addDocument: 'إضافة وثيقة', documentType: 'نوع الوثيقة', endDate: 'تاريخ الانتهاء', 
    technicalInspection: 'فحص تقني', license: 'رخصة', expired: 'منتهية', 
    expiringSoon: 'تنتهي قريباً', valid: 'صالح', endsOn: 'ينتهي في', noDocuments: 'لا توجد وثائق مسجلة.',
    reminders: 'التذكيرات', addReminder: 'إضافة تذكير', noReminders: 'لا توجد تذكيرات حالياً.',
    oil: 'زيت', inspection: 'فحص', overdue: 'متأخر', soon: 'قريب', after: 'بعد', days: 'يوم', km: 'كم', active: 'نشط',
    backup: 'النسخ الاحتياطي', aboutApp: 'حول التطبيق',
    dataProtection: 'حماية البيانات', backupDesc: 'بياناتك محفوظة على هاتفك فقط. قم بتصديرها كملف احتياطي لضمان عدم ضياعها.',
    exportData: 'تصدير البيانات (JSON)', importData: 'استيراد البيانات',
    exportSuccess: 'تم تصدير البيانات بنجاح!', confirmImport: 'تحذير: سيتم استبدال جميع بياناتك الحالية. هل أنت متأكد؟',
    importSuccess: 'تم استيراد البيانات بنجاح! سيتم إعادة التشغيل.', importError: 'خطأ: الملف غير صالح أو تالف.',

    // ✅ مفاتيح الصفحات الجديدة
    notifications: 'مركز التنبيهات', inbox: 'التنبيهات', reports: 'التقارير', resale: 'تقييم السيارة', timeline: 'سجل السيارة',
    unread: 'جديد', markAllRead: 'تحديد الكل كمقروء', clearAll: 'مسح الكل', noNotifications: 'لا توجد تنبيهات حالياً.',
    monthlyExpenses: 'المصاريف الشهرية', estimatedValue: 'القيمة التقديرية', printReport: 'طباعة التقرير', shareReport: 'مشاركة التقرير',
    
    // ✅ مفاتيح صفحة الإعدادات الجديدة
    preferences: 'التفضيلات الإقليمية', privacyAndSecurity: 'الخصوصية والأمان', version: 'الإصدار'
  },
  en: { 
    home: 'Home', expenses: 'Expenses', maintenance: 'Maintenance', documents: 'Documents', more: 'More', settings: 'Settings', 
    save: 'Save', cancel: 'Cancel', welcome: 'Welcome,', edit: 'Edit', confirmDelete: 'Are you sure you want to delete?',
    confirmDeleteCar: 'Are you sure you want to delete this car?',
    month: 'This Month', viewAll: 'View All', noData: 'Not enough data',
    darkMode: 'Dark Mode', lightMode: 'Light Mode', language: 'Language', currency: 'Currency',
    totalCost: 'Total Cost', costPerKm: 'Cost per KM', distributionByType: 'Expense Distribution', 
    quickActions: 'Quick Actions', distance: 'Total Distance', nextMaintenance: 'Next Maintenance', 
    expiringDocs: 'Expiring Documents', recentActivity: 'Recent Activity',
    currentCar: 'Current Car', monthlyCost: 'Monthly Cost', upcomingMaintenance: 'Upcoming Maintenance', expense: 'Expense', upcomingAlerts: 'Important Alerts',
    vehicles: 'My Vehicles', carInfo: 'Car Information', switchCar: 'Switch Car', addNewCar: 'Add Vehicle', 
    noVehicles: 'No vehicle registered.', noVehiclesAdded: 'No vehicles added. Click (+) to add a vehicle.',
    fillRequiredFields: 'Please fill in the required fields', addYourCar: 'Add Your Car', 
    addYourCarSubtitle: 'Enter your first car details to start tracking.', carMake: 'Make (e.g., Toyota)', 
    carModel: 'Model (e.g., Corolla)', plateNumber: 'Plate Number (Optional)', 
    currentOdometer: 'Current Odometer (KM)', saveAndContinue: 'Save and Continue',
    editCar: 'Edit Car', editCarSubtitle: 'Update your car details.',
    carYear: 'Year (Optional)', carColor: 'Color (Optional)',
    appName: 'My Car Companion', welcomeMessagePart1: 'Control your car expenses, track maintenance, and save', 
    welcomeMessagePart2: 'of your budget smartly.', startNow: 'Start Now',
    expenseType: 'Expense Type', amount: 'Amount', enterAmount: 'Enter amount', addExpense: 'Add Expense',
    noExpenses: 'No expenses recorded.', insurance: 'Insurance', taxes: 'Taxes', carWash: 'Car Wash', fines: 'Traffic Fines', parking: 'Parking', other: 'Other',
    fuel: 'Fuel Log', addFuel: 'Add Fuel', odometer: 'Odometer', liters: 'Liters', 
    cost: 'Cost', noFuelRecords: 'No fuel records found.', date: 'Date',
    addMaintenance: 'Add Maintenance', maintenanceType: 'Maintenance Type', oilChange: 'Oil Change', tires: 'Tires', 
    brakes: 'Brakes', battery: 'Battery', airFilter: 'Air Filter', fullInspection: 'Full Inspection',
    nextOdometer: 'Next Maintenance Odometer', enterCost: 'Enter cost', optional: 'Optional',
    noMaintenanceRecords: 'No maintenance records.', nextChange: 'Next change', noNextMaintenance: 'No next maintenance',
    addDocument: 'Add Document', documentType: 'Document Type', endDate: 'End Date', 
    technicalInspection: 'Technical Inspection', license: 'License', expired: 'Expired', 
    expiringSoon: 'Expiring Soon', valid: 'Valid', endsOn: 'Ends on', noDocuments: 'No documents registered.',
    reminders: 'Reminders', addReminder: 'Add Reminder', noReminders: 'No reminders yet.',
    oil: 'Oil', inspection: 'Inspection', overdue: 'Overdue', soon: 'Soon', after: 'After', days: 'days', km: 'km', active: 'Active',
    backup: 'Backup', aboutApp: 'About App',
    dataProtection: 'Data Protection', backupDesc: 'Your data is saved on your phone only. Export it as a backup file.',
    exportData: 'Export Data (JSON)', importData: 'Import Data',
    exportSuccess: 'Data exported successfully!', confirmImport: 'Warning: This will overwrite your current data. Are you sure?',
    importSuccess: 'Data imported successfully! Reloading...', importError: 'Error: Invalid or corrupted file.',

    // ✅ New pages keys
    notifications: 'Notifications', inbox: 'Inbox', reports: 'Reports', resale: 'Resale Value', timeline: 'Timeline',
    unread: 'New', markAllRead: 'Mark all read', clearAll: 'Clear all', noNotifications: 'No notifications yet.',
    monthlyExpenses: 'Monthly Expenses', estimatedValue: 'Estimated Value', printReport: 'Print Report', shareReport: 'Share Report',

    // ✅ New settings keys
    preferences: 'Regional Preferences', privacyAndSecurity: 'Privacy & Security', version: 'Version'
  },
  fr: { 
    home: 'Accueil', expenses: 'Dépenses', maintenance: 'Entretien', documents: 'Documents', more: 'Plus', settings: 'Paramètres', 
    save: 'Enregistrer', cancel: 'Annuler', welcome: 'Bienvenue,', edit: 'Modifier', confirmDelete: 'Êtes-vous sûr de vouloir supprimer?',
    confirmDeleteCar: 'Êtes-vous sûr de vouloir supprimer cette voiture ?',
    month: 'Ce Mois', viewAll: 'Voir Tout', noData: 'Pas assez de données',
    darkMode: 'Mode Sombre', lightMode: 'Mode Clair', language: 'Langue', currency: 'Devise',
    totalCost: 'Coût Total', costPerKm: 'Coût par KM', distributionByType: 'Répartition des Dépenses', 
    quickActions: 'Actions Rapides', distance: 'Distance Totale', nextMaintenance: 'Prochain Entretien', 
    expiringDocs: 'Documents Expirants', recentActivity: 'Activité Récente',
    currentCar: 'Voiture Actuelle', monthlyCost: 'Coût Mensuel', upcomingMaintenance: 'Prochain Entretien', expense: 'Dépense', upcomingAlerts: 'Alertes Importantes',
    vehicles: 'Mes Véhicules', carInfo: 'Informations du Véhicule', switchCar: 'Changer de Voiture', addNewCar: 'Ajouter Véhicule', 
    noVehicles: 'Aucun véhicule enregistré.', noVehiclesAdded: 'Aucun véhicule ajouté. Cliquez sur (+) pour ajouter un véhicule.',
    fillRequiredFields: 'Veuillez remplir les champs obligatoires', addYourCar: 'Ajoutez votre voiture', 
    addYourCarSubtitle: 'Entrez les détails de votre première voiture pour commencer le suivi.', carMake: 'Marque (ex: Toyota)', 
    carModel: 'Modèle (ex: Corolla)', plateNumber: 'Numéro de plaque (Optionnel)', 
    currentOdometer: 'Compteur actuel (KM)', saveAndContinue: 'Enregistrer et Continuer',
    editCar: 'Modifier la voiture', editCarSubtitle: 'Mettez à jour les détails de votre voiture.',
    carYear: 'Année (Optionnel)', carColor: 'Couleur (Optionnel)',
    appName: 'Mon Compagnon Auto', welcomeMessagePart1: 'Contrôlez les dépenses de votre voiture, suivez son entretien et économisez', 
    welcomeMessagePart2: 'de votre budget intelligemment.', startNow: 'Commencer',
    expenseType: 'Type de dépense', amount: 'Montant', enterAmount: 'Entrer le montant', addExpense: 'Ajouter Dépense',
    noExpenses: 'Aucune dépense enregistrée.', insurance: 'Assurance', taxes: 'Impôts', carWash: 'Lavage', fines: 'Amendes', parking: 'Stationnement', other: 'Autre',
    fuel: 'Journal de Carburant', addFuel: 'Ajouter Carburant', odometer: 'Compteur Kilométrique', liters: 'Litres', 
    cost: 'Coût', noFuelRecords: 'Aucun enregistrement de carburant.', date: 'Date',
    addMaintenance: 'Ajouter Entretien', maintenanceType: 'Type d\'entretien', oilChange: 'Vidange d\'huile', tires: 'Pneus', 
    brakes: 'Freins', battery: 'Batterie', airFilter: 'Filtre à air', fullInspection: 'Inspection complète',
    nextOdometer: 'Compteur pour le prochain entretien', enterCost: 'Entrer le coût', optional: 'Optionnel',
    noMaintenanceRecords: 'Aucun enregistrement d\'entretien.', nextChange: 'Prochain changement', noNextMaintenance: 'Pas de prochain entretien',
    addDocument: 'Ajouter Document', documentType: 'Type de document', endDate: 'Date d\'expiration', 
    technicalInspection: 'Contrôle technique', license: 'Permis', expired: 'Expiré', 
    expiringSoon: 'Expire bientôt', valid: 'Valide', endsOn: 'Expire le', noDocuments: 'Aucun document enregistré.',
    reminders: 'Rappels', addReminder: 'Ajouter un rappel', noReminders: 'Aucun rappel pour le moment.',
    oil: 'Huile', inspection: 'Inspection', overdue: 'En retard', soon: 'Bientôt', after: 'Après', days: 'jours', km: 'km', active: 'Actif',
    backup: 'Sauvegarde', aboutApp: 'À propos',
    dataProtection: 'Protection des données', backupDesc: 'Vos données sont enregistrées sur votre téléphone uniquement. Exportez-les sous forme de fichier de sauvegarde.',
    exportData: 'Exporter les données (JSON)', importData: 'Importer des données',
    exportSuccess: 'Données exportées avec succès!', confirmImport: 'Attention : Cela écrasera vos données actuelles. Êtes-vous sûr ?',
    importSuccess: 'Données importées avec succès ! Redémarrage...', importError: 'Erreur : Fichier invalide ou corrompu.',

    // ✅ Nouvelles pages
    notifications: 'Notifications', inbox: 'Boîte', reports: 'Rapports', resale: 'Revente', timeline: 'Historique',
    unread: 'Nouveau', markAllRead: 'Tout lire', clearAll: 'Effacer', noNotifications: 'Aucune notification.',
    monthlyExpenses: 'Dépenses mensuelles', estimatedValue: 'Valeur estimée', printReport: 'Imprimer', shareReport: 'Partager',

    // ✅ Nouvelles clés de paramètres
    preferences: 'Préférences Régionales', privacyAndSecurity: 'Confidentialité & Sécurité', version: 'Version'
  }
};

export const AppProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(() => {
    try {
      const saved = localStorage.getItem('savedCar');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vehicles')) || [];
      if (saved.length === 0) {
        const savedCar = JSON.parse(localStorage.getItem('savedCar'));
        return savedCar ? [savedCar] : [];
      }
      return saved;
    } catch (e) { return []; }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'MAD');

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
    try {
      const newCar = { ...carData, id: Date.now().toString() };
      const updatedVehicles = [...vehicles, newCar];
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      setCurrentCar(newCar);
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error("Storage Error:", error);
      alert("مساحة التخزين ممتلئة. يرجى اختيار صورة أصغر الحجم أو حذف بعض البيانات.");
    }
  };

  const updateCar = (updatedCarData) => {
    try {
      const updatedVehicles = vehicles.map(v => v.id === updatedCarData.id ? updatedCarData : v);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      if (currentCar?.id === updatedCarData.id) {
        localStorage.setItem('savedCar', JSON.stringify(updatedCarData));
        setCurrentCar(updatedCarData);
      }
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error("Storage Error:", error);
      alert("مساحة التخزين ممتلئة. تعذر حفظ التعديلات.");
    }
  };

  const deleteCar = (id) => {
    try {
      const updatedVehicles = vehicles.filter(v => v.id !== id);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      if (currentCar?.id === id) {
        const nextCar = updatedVehicles.length > 0 ? updatedVehicles[0] : null;
        setCurrentCar(nextCar);
        if (nextCar) {
          localStorage.setItem('savedCar', JSON.stringify(nextCar));
        } else {
          localStorage.removeItem('savedCar');
        }
      }
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const selectCar = (car) => {
    localStorage.setItem('savedCar', JSON.stringify(car));
    setCurrentCar(car);
  };

  const t = (key) => translations[lang]?.[key] || key;

  return (
    <AppContext.Provider value={{ 
      currentCar, vehicles, addNewCar, updateCar, deleteCar, selectCar, 
      isLoading, theme, toggleTheme, lang, changeLang, currency, setCurrency, t 
    }}>
      {children}
    </AppContext.Provider>
  );
};
