import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// ✅ 1. تم إزالة استيراد useContext و AppContext القديم
import { useUser } from '../../contexts/UserContext';
import { useCar } from '../../contexts/CarContext'; 
import { useDashboard } from '../../contexts/DashboardContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from '../../hooks/useTranslation';

// ✅ 2. الهيكل الأساسي
import Layout from '../../shared/components/layout/Layout.jsx';

// ✅ 3. صفحات التسويق (متاحة للجميع)
import Welcome from '../../pages/Welcome.jsx';
import Onboarding from '../../pages/Onboarding.jsx';
import Login from '../../pages/Login.jsx';
import AddVehicle from '../../pages/AddVehicle.jsx';
import About from '../../pages/About.jsx';

// ✅ 4. الصفحات الأساسية (تتطلب سيارة)
import Dashboard from '../../pages/Dashboard.jsx';
import Fuel from '../../pages/Fuel.jsx';
import Maintenance from '../../pages/Maintenance.jsx';
import Expenses from '../../pages/Expenses.jsx';
import Income from '../../pages/Income.jsx';
import Documents from '../../pages/Documents.jsx';
import Reminders from '../../pages/Reminders.jsx';
import Vehicles from '../../pages/Vehicles.jsx';
import More from '../../pages/More.jsx';

// ✅ 5. الصفحات المتقدمة (تتطلب سيارة)
import Notifications from '../../pages/Notifications.jsx';
import Reports from '../../pages/Reports.jsx';
import Timeline from '../../pages/Timeline.jsx';
import Valuation from '../../pages/Valuation.jsx';
import FuelStations from '../../pages/FuelStations.jsx';
import ReportPrint from '../../pages/ReportPrint.jsx';
import Assistance from '../../pages/Assistance.jsx';

// ✅ 6. الصفحات النظامية
import Settings from '../../pages/Settings.jsx';
import Backup from '../../pages/Backup.jsx';

/* =========================================================
   الحماية (Route Guard)
   ========================================================= */
const ProtectedRoute = () => {
  // ✅ 3. تم استبدال AppContext بـ useCar
  const { currentCar } = useCar(); 
  return currentCar ? <Outlet /> : <Navigate to="/welcome" />;
};

export default function AppRoutes() {
  // ✅ 4. تم استبدال AppContext بالخطافات الجديدة
  const { lang } = useSettings();
  const { t } = useTranslation(lang);
  const { isLoading } = useDashboard(); // حالة التحميل تأتي الآن من لوحة القيادة

  // شاشة تحميل محسنة
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center" aria-live="polite">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[var(--text-secondary)] font-medium">
          {t ? t('loading') : 'جاري التحميل...'}
        </span>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* المسارات العامة */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />

        {/* المسارات المحمية (تتطلب سيارة) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/valuation" element={<Valuation />} />
            <Route path="/fuel-stations" element={<FuelStations />} />
            <Route path="/report-print" element={<ReportPrint />} />
            <Route path="/assistance" element={<Assistance />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/more" element={<More />} />
          </Route>
        </Route>

        {/* إضافة سيارة */}
        <Route path="/add-vehicle" element={<AddVehicle />} />

        {/* مسار افتراضي لأي رابط غير موجود */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
