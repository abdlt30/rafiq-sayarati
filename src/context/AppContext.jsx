import { createContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/dbService'; 

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
    carModel: 'الموديل (مثال: كورولا)', plateNumber: 'رقم اللوحة (اختياري)', plate: 'اللوحة',
    currentOdometer: 'عداد السيارة الحالي (KM)', saveAndContinue: 'حفظ ومتابعة',
    editCar: 'تعديل السيارة', editCarSubtitle: 'قم بتحديث بيانات سيارتك.',
    carYear: 'سنة الصنع (اختياري)', carColor: 'اللون (اختياري)',
    appName: 'رفيق سيارتي', welcomeMessagePart1: 'تحكم في مصاريف سيارتك، تابع صيانتها، ووفر', 
    welcomeMessagePart2: 'من ميزانيتك بذكاء.', startNow: 'ابدأ الآن',
    expenseType: 'نوع المصروف', amount: 'المبلغ', enterAmount: 'أدخل المبلغ', addExpense: 'إضافة مصروف',
    noExpenses: 'لا توجد مصاريف مسجلة.', insurance: 'تأمين', taxes: 'ضرائب', carWash: 'غسيل', fines: 'مخالفات مرورية', parking: 'رسوم مواقف', other: 'أخرى',
    fuel: 'سجل الوقود', addFuel: 'إضافة وقود', odometer: 'العداد', liters: 'اللترات', 
    cost: 'التكلفة', noFuelRecords: 'لا توجد سجلات وقود.', date: 'التاريخ', firstFill: 'أول تعبئة',
    addMaintenance: 'إضافة صيانة', maintenanceType: 'نوع الصيانة', 
    oilChange: 'تغيير زيت', tires: 'إطارات', brakes: 'فرامل', battery: 'بطارية', airFilter: 'فلتر هواء', fullInspection: 'فحص شامل', otherMaintenance: 'أخرى',
    nextOdometer: 'العداد للصيانة القادمة', enterCost: 'أدخل التكلفة', optional: 'اختياري', addType: 'إضافة نوع', enterCustomTypeName: 'أدخل اسم نوع الصيانة الجديد:',
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
    notifications: 'مركز التنبيهات', inbox: 'التنبيهات', reports: 'التقارير', resale: 'تقييم السيارة', timeline: 'سجل السيارة',
    unread: 'جديد', markAllRead: 'تحديد الكل كمقروء', clearAll: 'مسح الكل', noNotifications: 'لا توجد تنبيهات حالياً.',
    monthlyExpenses: 'المصاريف الشهرية', estimatedValue: 'القيمة التقديرية', printReport: 'طباعة التقرير', shareReport: 'مشاركة التقرير',
    preferences: 'التفضيلات الإقليمية', privacyAndSecurity: 'الخصوصية والأمان', version: 'الإصدار',
    selectCurrency: 'اختر العملة', searchCurrency: 'ابحث عن عملة...',
    privacyText: 'جميع بياناتك محفوظة على هاتفك فقط. نحن لا نجمع أي بيانات شخصية. عند تفعيل المزامنة السحابية، ستكون بياناتك مشفرة وآمنة.',
    noResults: 'لا توجد نتائج',
    management: 'الإدارة', insights: 'التحليلات', system: 'النظام',
    avgConsumption: 'متوسط الاستهلاك', totalLiters: 'إجمالي اللترات',
    externalNotifications: 'الإشعارات الخارجية', defaultTypes: 'أنواع افتراضية',
    
    fuelStations: 'محطات الوقود',
    valuation: 'تقييم السيارة',
    errorSaving: 'حدث خطأ أثناء الحفظ.',
    errorSavingMsg: 'حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.',
    confirmDeleteBtn: 'نعم، احذف',
    add: 'إضافة',
    manageFleet: 'إدارة أسطول سياراتك',
    totalFuelCost: 'إجمالي الوقود',
    totalExpenses: 'إجمالي المصاريف',
    expenseDistribution: 'توزيع المصاريف',
    pdfReport: 'تقرير PDF',
    storageFull: 'مساحة التخزين ممتلئة. يرجى اختيار صورة أصغر أو حذف بعض البيانات.',
    storageError: 'تعذر حفظ التعديلات. مساحة التخزين ممتلئة.',

    invalidNumbers: 'الرجاء إدخال أرقام صحيحة أكبر من صفر.',
    invalidOdometer: 'العداد لا يمكن أن يكون أقل من العداد السابق للسيارة.',
    saveSuccess: 'تم حفظ البيانات بنجاح!',

    income: 'الإيرادات',
    totalIncome: 'إجمالي الإيرادات',
    noIncome: 'لا توجد إيرادات مسجلة.',
    incomeType: 'نوع الإيراد',
    rideIncome: 'رحلات / توصيل',
    rentalIncome: 'تأجير السيارة',
    deliveryIncome: 'توصيل طرود',
    otherIncome: 'إيراد آخر',
    netProfit: 'صافي الربح',
    saveIncome: 'حفظ الإيراد',
    notes: 'ملاحظات',

    financialReport: 'تقرير مالي',
    printPdf: 'طباعة / PDF',
    allPeriods: 'كل الفترات',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذه السنة',
    car: 'السيارة',
    financialSummary: 'الملخص المالي',
    category: 'الفئة',
    percentage: 'النسبة',
    total: 'الإجمالي',
    otherExpenses: 'مصاريف أخرى',
    fuelLog: 'سجل الوقود',
    maintenanceLog: 'سجل الصيانة',
    comprehensiveFinancialReport: 'تقرير مالي شامل',
    issueDate: 'تاريخ الإصدار',
    reportFooter1: 'تم إنشاء هذا التقرير بواسطة تطبيق رفيق سيارتي',
    reportFooter2: 'هذا التقرير تم توليده آلياً بناءً على البيانات التي قام المستخدم بإدخالها.',

    lastBackup: 'آخر نسخة احتياطية:',
    exportDataBtn: 'تصدير البيانات',
    exportDesc: 'حفظ نسخة على هاتفك (JSON)',
    importDataBtn: 'استيراد البيانات',
    importDesc: 'استعادة نسخة سابقة من ملف',
    importWarning: 'تنبيه: عملية الاستيراد ستقوم بمسح جميع البيانات الحالية واستبدالها بالبيانات الموجودة في الملف. يرجى التأكد قبل المتابعة.',
    errorExport: 'حدث خطأ أثناء تصدير البيانات.',
    backupAndExport: 'النسخ الاحتياطي والتصدير',
    exportCenter: 'مركز التصدير',
    excelExport: 'جدول بيانات (Excel)',
    printData: 'طباعة مباشرة',
    systemBackup: 'النسخة الاحتياطية للنظام',
    excelSuccess: 'تم تصدير جدول البيانات بنجاح!',
    all: 'الكل',

    powertrain: 'نوع المحرك',
    ice: 'بنزين / ديزل',
    ev: 'كهربائية',
    hybrid: 'هجينة',
    batteryCapacity: 'سعة البطارية (kWh)',
    fuelType: 'نوع الوقود',
    petrol: 'بنزين',
    diesel: 'ديزل',
    electric: 'كهرباء',
    kwh: 'كيلوواط/ساعة (kWh)',
    consumptionL100km: 'لتر/100كم',
    consumptionKwh100km: 'كيلوواط/100كم',
    chargingLog: 'سجل الشحن',
    noChargingRecords: 'لا توجد سجلات شحن.',
    addCharging: 'إضافة شحن',
    energySource: 'مصدر الطاقة',
    gasoline: 'بنزين',
    electricity: 'كهرباء (شحن)',

    evMaintenance: 'صيانة كهربائية',
    engineOil: 'زيت المحرك',
    oilFilter: 'فلتر الزيت',
    sparkPlugs: 'شمعات الاحتراق',
    timingBelt: 'سير التوقيت',
    fuelFilter: 'فلتر الوقود',
    coolant: 'سائل التبريد',
    brakeFluid: 'سائل الفرامل',
    cabinFilter: 'فلتر هواء المقصورة',
    transmissionOil: 'زيت ناقل الحركة',
    battery12v: 'بطارية 12V',
    airBrakes: 'فرامل هوائية',
    adBlue: 'سائل AdBlue',
    chassisLubrication: 'تشحيم الشاسيه',
    engineHours: 'ساعات المحرك',
    suspensionCheck: 'فحص نظام التعليق',
    steeringCheck: 'فحص نظام التوجيه',
    hvacService: 'صيانة التكييف',
    softwareUpdate: 'تحديث برمجي',
    batteryCheck: 'فحص البطارية الرئيسية',

    currency_MAD: 'درهم مغربي', currency_SAR: 'ريال سعودي', currency_AED: 'درهم إماراتي', 
    currency_EGP: 'جنيه مصري', currency_QAR: 'ريال قطري', currency_KWD: 'دينار كويتي', 
    currency_BHD: 'دينار بحريني', currency_OMR: 'ريال عماني', currency_JOD: 'دينار أردني', 
    currency_DZD: 'دينار جزائري', currency_TND: 'دينار تونسي', currency_LYD: 'دينار ليبي', 
    currency_USD: 'دولار أمريكي', currency_EUR: 'يورو'
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
    carModel: 'Model (e.g., Corolla)', plateNumber: 'Plate Number (Optional)', plate: 'Plate',
    currentOdometer: 'Current Odometer (KM)', saveAndContinue: 'Save and Continue',
    editCar: 'Edit Car', editCarSubtitle: 'Update your car details.',
    carYear: 'Year (Optional)', carColor: 'Color (Optional)',
    appName: 'My Car Companion', welcomeMessagePart1: 'Control your car expenses, track maintenance, and save', 
    welcomeMessagePart2: 'of your budget smartly.', startNow: 'Start Now',
    expenseType: 'Expense Type', amount: 'Amount', enterAmount: 'Enter amount', addExpense: 'Add Expense',
    noExpenses: 'No expenses recorded.', insurance: 'Insurance', taxes: 'Taxes', carWash: 'Car Wash', fines: 'Traffic Fines', parking: 'Parking', other: 'Other',
    fuel: 'Fuel Log', addFuel: 'Add Fuel', odometer: 'Odometer', liters: 'Liters', 
    cost: 'Cost', noFuelRecords: 'No fuel records found.', date: 'Date', firstFill: 'First Fill',
    addMaintenance: 'Add Maintenance', maintenanceType: 'Maintenance Type', 
    oilChange: 'Oil Change', tires: 'Tires', brakes: 'Brakes', battery: 'Battery', airFilter: 'Air Filter', fullInspection: 'Full Inspection', otherMaintenance: 'Other',
    nextOdometer: 'Next Maintenance Odometer', enterCost: 'Enter cost', optional: 'Optional', addType: 'Add Type', enterCustomTypeName: 'Enter new maintenance type name:',
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
    notifications: 'Notifications', inbox: 'Inbox', reports: 'Reports', resale: 'Resale Value', timeline: 'Timeline',
    unread: 'New', markAllRead: 'Mark all read', clearAll: 'Clear all', noNotifications: 'No notifications yet.',
    monthlyExpenses: 'Monthly Expenses', estimatedValue: 'Estimated Value', printReport: 'Print Report', shareReport: 'Share Report',
    preferences: 'Regional Preferences', privacyAndSecurity: 'Privacy & Security', version: 'Version',
    selectCurrency: 'Select Currency', searchCurrency: 'Search for a currency...',
    privacyText: 'All your data is stored locally on your phone. We do not collect any personal data. When cloud sync is enabled, your data will be encrypted and secure.',
    noResults: 'No results found',
    management: 'Management', insights: 'Insights', system: 'System',
    avgConsumption: 'Average Consumption', totalLiters: 'Total Liters',
    externalNotifications: 'External Notifications', defaultTypes: 'Default Types',

    fuelStations: 'Fuel Stations',
    valuation: 'Car Valuation',
    errorSaving: 'Error during saving.',
    errorSavingMsg: 'Error saving data. Please try again.',
    confirmDeleteBtn: 'Yes, Delete',
    add: 'Add',
    manageFleet: 'Manage your fleet',
    totalFuelCost: 'Total Fuel Cost',
    totalExpenses: 'Total Expenses',
    expenseDistribution: 'Expense Distribution',
    pdfReport: 'PDF Report',
    storageFull: 'Storage is full. Please choose a smaller image or delete some data.',
    storageError: 'Failed to save changes. Storage is full.',

    invalidNumbers: 'Please enter valid numbers greater than zero.',
    invalidOdometer: 'Odometer cannot be less than the previous reading.',
    saveSuccess: 'Data saved successfully!',

    income: 'Income',
    totalIncome: 'Total Income',
    noIncome: 'No income recorded.',
    incomeType: 'Income Type',
    rideIncome: 'Rides / Delivery',
    rentalIncome: 'Car Rental',
    deliveryIncome: 'Package Delivery',
    otherIncome: 'Other Income',
    netProfit: 'Net Profit',
    saveIncome: 'Save Income',
    notes: 'Notes',

    financialReport: 'Financial Report',
    printPdf: 'Print / PDF',
    allPeriods: 'All Periods',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    car: 'Car',
    financialSummary: 'Financial Summary',
    category: 'Category',
    percentage: 'Percentage',
    total: 'Total',
    otherExpenses: 'Other Expenses',
    fuelLog: 'Fuel Log',
    maintenanceLog: 'Maintenance Log',
    comprehensiveFinancialReport: 'Comprehensive Financial Report',
    issueDate: 'Issue Date',
    reportFooter1: 'This report was generated by My Car Companion App',
    reportFooter2: 'This report was generated automatically based on the data entered by the user.',

    lastBackup: 'Last backup:',
    exportDataBtn: 'Export Data',
    exportDesc: 'Save a copy to your phone (JSON)',
    importDataBtn: 'Import Data',
    importDesc: 'Restore a previous copy from a file',
    importWarning: 'Warning: Importing will erase all current data and replace it with the file data. Please confirm before proceeding.',
    errorExport: 'Error exporting data.',
    backupAndExport: 'Backup & Export',
    exportCenter: 'Export Center',
    excelExport: 'Spreadsheet (Excel)',
    printData: 'Print Directly',
    systemBackup: 'System Backup',
    excelSuccess: 'Spreadsheet exported successfully!',
    all: 'All',

    powertrain: 'Powertrain',
    ice: 'ICE (Petrol/Diesel)',
    ev: 'Electric (EV)',
    hybrid: 'Hybrid',
    batteryCapacity: 'Battery Capacity (kWh)',
    fuelType: 'Fuel Type',
    petrol: 'Petrol',
    diesel: 'Diesel',
    electric: 'Electric',
    kwh: 'kWh',
    consumptionL100km: 'L/100km',
    consumptionKwh100km: 'kWh/100km',
    chargingLog: 'Charging Log',
    noChargingRecords: 'No charging records.',
    addCharging: 'Add Charging',
    energySource: 'Energy Source',
    gasoline: 'Gasoline',
    electricity: 'Electricity (Charging)',

    evMaintenance: 'EV Maintenance',
    engineOil: 'Engine Oil',
    oilFilter: 'Oil Filter',
    sparkPlugs: 'Spark Plugs',
    timingBelt: 'Timing Belt',
    fuelFilter: 'Fuel Filter',
    coolant: 'Coolant',
    brakeFluid: 'Brake Fluid',
    cabinFilter: 'Cabin Air Filter',
    transmissionOil: 'Transmission Oil',
    battery12v: '12V Battery',
    airBrakes: 'Air Brakes',
    adBlue: 'AdBlue Fluid',
    chassisLubrication: 'Chassis Lubrication',
    engineHours: 'Engine Hours',
    suspensionCheck: 'Suspension Check',
    steeringCheck: 'Steering Check',
    hvacService: 'HVAC Service',
    softwareUpdate: 'Software Update',
    batteryCheck: 'Main Battery Check',

    currency_MAD: 'Moroccan Dirham', currency_SAR: 'Saudi Riyal', currency_AED: 'UAE Dirham', 
    currency_EGP: 'Egyptian Pound', currency_QAR: 'Qatari Riyal', currency_KWD: 'Kuwaiti Dinar', 
    currency_BHD: 'Bahraini Dinar', currency_OMR: 'Omani Rial', currency_JOD: 'Jordanian Dinar', 
    currency_DZD: 'Algerian Dinar', currency_TND: 'Tunisian Dinar', currency_LYD: 'Libyan Dinar', 
    currency_USD: 'US Dollar', currency_EUR: 'Euro'
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
    carModel: 'Modèle (ex: Corolla)', plateNumber: 'Numéro de plaque (Optionnel)', plate: 'Plaque',
    currentOdometer: 'Compteur actuel (KM)', saveAndContinue: 'Enregistrer et Continuer',
    editCar: 'Modifier la voiture', editCarSubtitle: 'Mettez à jour les détails de votre voiture.',
    carYear: 'Année (Optionnel)', carColor: 'Couleur (Optionnel)',
    appName: 'Mon Compagnon Auto', welcomeMessagePart1: 'Contrôlez les dépenses de votre voiture, suivez son entretien et économisez', 
    welcomeMessagePart2: 'de votre budget intelligemment.', startNow: 'Commencer',
    expenseType: 'Type de dépense', amount: 'Montant', enterAmount: 'Entrer le montant', addExpense: 'Ajouter Dépense',
    noExpenses: 'Aucune dépense enregistrée.', insurance: 'Assurance', taxes: 'Impôts', carWash: 'Lavage', fines: 'Amendes', parking: 'Stationnement', other: 'Autre',
    fuel: 'Journal de Carburant', addFuel: 'Ajouter Carburant', odometer: 'Compteur Kilométrique', liters: 'Litres', 
    cost: 'Coût', noFuelRecords: 'Aucun enregistrement de carburant.', date: 'Date', firstFill: 'Premier Plein',
    addMaintenance: 'Ajouter Entretien', maintenanceType: 'Type d\'entretien', 
    oilChange: 'Vidange d\'huile', tires: 'Pneus', brakes: 'Freins', battery: 'Batterie', airFilter: 'Filtre à air', fullInspection: 'Inspection complète', otherMaintenance: 'Autre',
    nextOdometer: 'Compteur pour le prochain entretien', enterCost: 'Entrer le coût', optional: 'Optionnel', addType: 'Ajouter Type', enterCustomTypeName: 'Entrez le nom du nouveau type d\'entretien:',
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
    notifications: 'Notifications', inbox: 'Boîte', reports: 'Rapports', resale: 'Revente', timeline: 'Historique',
    unread: 'Nouveau', markAllRead: 'Tout lire', clearAll: 'Effacer', noNotifications: 'Aucune notification.',
    monthlyExpenses: 'Dépenses mensuelles', estimatedValue: 'Valeur estimée', printReport: 'Imprimer', shareReport: 'Partager',
    preferences: 'Préférences Régionales', privacyAndSecurity: 'Confidentialité & Sécurité', version: 'Version',
    selectCurrency: 'Choisir la devise', searchCurrency: 'Rechercher une devise...',
    privacyText: 'Toutes vos données sont stockées localement sur votre téléphone. Nous ne collectons aucune donnée personnelle. Lorsque la synchronisation cloud est activée, vos données seront cryptées et sécurisées.',
    noResults: 'Aucun résultat trouvé',
    management: 'Gestion', insights: 'Analyses', system: 'Système',
    avgConsumption: 'Consommation Moyenne', totalLiters: 'Total Litres',
    externalNotifications: 'Notifications Externes', defaultTypes: 'Types par défaut',

    fuelStations: 'Stations-service',
    valuation: 'Évaluation',
    errorSaving: 'Erreur lors de l\'enregistrement.',
    errorSavingMsg: 'Erreur lors de l\'enregistrement. Veuillez réessayer.',
    confirmDeleteBtn: 'Oui, Supprimer',
    add: 'Ajouter',
    manageFleet: 'Gérer votre flotte',
    totalFuelCost: 'Coût Total du Carburant',
    totalExpenses: 'Dépenses Totales',
    expenseDistribution: 'Répartition des Dépenses',
    pdfReport: 'Rapport PDF',
    storageFull: 'Le stockage est plein. Veuillez choisir une image plus petite ou supprimer des données.',
    storageError: 'Échec de la sauvegarde. Le stockage est plein.',

    invalidNumbers: 'Veuillez saisir des chiffres valides supérieurs à zéro.',
    invalidOdometer: 'Le compteur ne peut pas être inférieur à la lecture précédente.',
    saveSuccess: 'Données enregistrées avec succès !',

    income: 'Revenus',
    totalIncome: 'Revenu Total',
    noIncome: 'Aucun revenu enregistré.',
    incomeType: 'Type de Revenu',
    rideIncome: 'Courses / Livraison',
    rentalIncome: 'Location de Voiture',
    deliveryIncome: 'Livraison de Colis',
    otherIncome: 'Autre Revenu',
    netProfit: 'Bénéfice Net',
    saveIncome: 'Enregistrer le Revenu',
    notes: 'Remarques',

    financialReport: 'Rapport Financier',
    printPdf: 'Imprimer / PDF',
    allPeriods: 'Toutes les périodes',
    thisMonth: 'Ce mois-ci',
    thisYear: 'Cette année',
    car: 'Voiture',
    financialSummary: 'Résumé Financier',
    category: 'Catégorie',
    percentage: 'Pourcentage',
    total: 'Total',
    otherExpenses: 'Autres Dépenses',
    fuelLog: 'Journal de Carburant',
    maintenanceLog: 'Journal d\'Entretien',
    comprehensiveFinancialReport: 'Rapport Financier Complet',
    issueDate: 'Date d\'émission',
    reportFooter1: 'Ce rapport a été généré par l\'application Mon Compagnon Auto',
    reportFooter2: 'Ce rapport a été généré automatiquement sur la base des données saisies par l\'utilisateur.',

    lastBackup: 'Dernière sauvegarde :',
    exportDataBtn: 'Exporter les données',
    exportDesc: 'Enregistrer une copie sur votre téléphone (JSON)',
    importDataBtn: 'Importer des données',
    importDesc: 'Restaurer une copie précédente à partir d\'un fichier',
    importWarning: 'Attention : L\'importation effacera toutes les données actuelles et les remplacera par celles du fichier. Veuillez confirmer avant de continuer.',
    errorExport: 'Erreur lors de l\'exportation des données.',
    backupAndExport: 'Sauvegarde et Exportation',
    exportCenter: 'Centre d\'exportation',
    excelExport: 'Feuille de calcul (Excel)',
    printData: 'Imprimer directement',
    systemBackup: 'Sauvegarde du système',
    excelSuccess: 'Feuille de calcul exportée avec succès !',
    all: 'Tout',

    powertrain: 'Groupe Motopropulseur',
    ice: 'Thermique (Essence/Diesel)',
    ev: 'Électrique (VE)',
    hybrid: 'Hybride',
    batteryCapacity: 'Capacité de la Batterie (kWh)',
    fuelType: 'Type de Carburant',
    petrol: 'Essence',
    diesel: 'Diesel',
    electric: 'Électrique',
    kwh: 'kWh',
    consumptionL100km: 'L/100km',
    consumptionKwh100km: 'kWh/100km',
    chargingLog: 'Journal de Recharge',
    noChargingRecords: 'Aucun enregistrement de recharge.',
    addCharging: 'Ajouter Recharge',
    energySource: 'Source d\'Énergie',
    gasoline: 'Essence',
    electricity: 'Électricité (Recharge)',

    evMaintenance: 'Entretien VE',
    engineOil: 'Huile Moteur',
    oilFilter: 'Filtre à Huile',
    sparkPlugs: 'Bougies d\'Allumage',
    timingBelt: 'Courroie de Distribution',
    fuelFilter: 'Filtre à Carburant',
    coolant: 'Liquide de Refroidissement',
    brakeFluid: 'Liquide de Frein',
    cabinFilter: 'Filtre d\'Habitacle',
    transmissionOil: 'Huile de Transmission',
    battery12v: 'Batterie 12V',
    airBrakes: 'Freins Pneumatiques',
    adBlue: 'AdBlue',
    chassisLubrication: 'Lubrification du Châssis',
    engineHours: 'Heures Moteur',
    suspensionCheck: 'Vérification Suspension',
    steeringCheck: 'Vérification Direction',
    hvacService: 'Entretien Climatisation',
    softwareUpdate: 'Mise à Jour Logicielle',
    batteryCheck: 'Vérification Batterie',

    currency_MAD: 'Dirham Marocain', currency_SAR: 'Riyal Saoudien', currency_AED: 'Dirham des Émirats', 
    currency_EGP: 'Livre Égyptienne', currency_QAR: 'Riyal Qatari', currency_KWD: 'Dinar Koweïtien', 
    currency_BHD: 'Dinar Bahreïni', currency_OMR: 'Rial Omani', currency_JOD: 'Dinar Jordanien', 
    currency_DZD: 'Dinar Algérien', currency_TND: 'Dinar Tunisien', currency_LYD: 'Dinar Libyen', 
    currency_USD: 'Dollar Américain', currency_EUR: 'Euro'
  }
};

export const AppProvider = ({ children }) => {
  
  /* ===================== user ===================== */
  const [user, setUserState] = useState(() => {
    try {
      const savedName = localStorage.getItem('user_name');
      return savedName ? { name: savedName } : null;
    } catch (e) { return null; }
  });

  const setUser = (userData) => {
    setUserState(userData);
    if (userData && userData.name) {
      localStorage.setItem('user_name', userData.name);
    } else {
      localStorage.removeItem('user_name');
    }
  };

  /* ===================== car ===================== */
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

  /* ===================== UI ===================== */
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'MAD');

  /* ✅ NEW: عداد إصدار البيانات (لإعادة حساب useMemo في Dashboard تلقائياً) */
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => {
    setDataVersion(v => v + 1);
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

  /* ✅ تحقق من صحة اللغة المدعومة */
  const changeLang = useCallback((newLang) => {
    if (['ar', 'en', 'fr'].includes(newLang)) {
      setLang(newLang);
    }
  }, []);

  /* ✅ مُستقر عبر الـ re-renders ما لم تتغيّر اللغة */
  const t = useCallback((key) => translations[lang]?.[key] || key, [lang]);

  /* ===================== مساعد داخلي: تحقق من العداد ===================== */
  const validateOdometer = (input, { required = false } = {}) => {
    if (input === undefined || input === null || String(input).trim() === '') {
      return required ? { valid: false } : { valid: true, value: 0 };
    }
    const num = Number(input);
    if (!Number.isFinite(num) || num < 0) {
      return { valid: false };
    }
    return { valid: true, value: num };
  };

  /* ===================== CRUD السيارات ===================== */
  const addNewCar = (carData) => {
    try {
      if (!carData || typeof carData !== 'object') {
        return false;
      }

      const odoCheck = validateOdometer(carData.odometer, { required: false });
      if (!odoCheck.valid) {
        throw new Error("Invalid Odometer");
      }

      const newCar = {
        ...carData,
        odometer: odoCheck.value,
        id: Date.now().toString(),
      };

      const updatedVehicles = [...vehicles, newCar];
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      setCurrentCar(newCar);
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (error) {
      console.error("Storage Error:", error);
      if (error.message === "Invalid Odometer") {
        alert(t('invalidNumbers') || 'الرجاء إدخال أرقام صحيحة.');
      } else {
        alert(t('storageFull') || 'مساحة التخزين ممتلئة. يرجى اختيار صورة أصغر الحجم أو حذف بعض البيانات.');
      }
      return false;
    }
  };

  const updateCar = (carId, updatedData) => {
    try {
      if (!carId || !updatedData || typeof updatedData !== 'object') {
        return false;
      }

      const sanitized = { ...updatedData };
      if (sanitized.odometer !== undefined) {
        const odoCheck = validateOdometer(sanitized.odometer, { required: true });
        if (!odoCheck.valid) {
          throw new Error("Invalid Odometer");
        }
        sanitized.odometer = odoCheck.value;
      }

      const updatedVehicles = vehicles.map(v =>
        v.id === carId ? { ...v, ...sanitized } : v
      );
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

      if (currentCar?.id === carId) {
        const newCurrentCar = { ...currentCar, ...sanitized };
        localStorage.setItem('savedCar', JSON.stringify(newCurrentCar));
        setCurrentCar(newCurrentCar);
      }
      setVehicles(updatedVehicles);
      bumpDataVersion();
      return true;
    } catch (error) {
      console.error("Storage Error:", error);
      if (error.message === "Invalid Odometer") {
        alert(t('invalidNumbers') || 'الرجاء إدخال أرقام صحيحة.');
      } else {
        alert(t('storageError') || 'مساحة التخزين ممتلئة. تعذر حفظ التعديلات.');
      }
      return false;
    }
  };

  const deleteCar = (id) => {
    try {
      if (!id) return false;

      if (dbService && dbService.deleteCarData) {
        try {
          dbService.deleteCarData(id);
        } catch (dbErr) {
          console.error("dbService.deleteCarData failed:", dbErr);
        }
      }

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
      bumpDataVersion();
      return true;
    } catch (error) {
      console.error("Delete Error:", error);
      return false;
    }
  };

  const selectCar = (car) => {
    if (!car || typeof car !== 'object') return;
    localStorage.setItem('savedCar', JSON.stringify(car));
    setCurrentCar(car);
  };

  /* ===================== Context Value ===================== */
  return (
    <AppContext.Provider value={{ 
      currentCar, vehicles, addNewCar, updateCar, deleteCar, selectCar, 
      isLoading, theme, toggleTheme, lang, changeLang, currency, setCurrency, t,
      user, setUser,
      /* ✅ جديد - يستخدمه Dashboard/Reports لإعادة الحساب */
      dataVersion, bumpDataVersion,
    }}>
      {children}
    </AppContext.Provider>
  );
};
