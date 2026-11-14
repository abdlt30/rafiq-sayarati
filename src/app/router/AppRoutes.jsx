import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx'; // ✅ إضافة .jsx

// ✅ 1. الهيكل الجديد (shared)
import Layout from '../../shared/components/layout/Layout.jsx'; // ✅ إضافة .jsx

// ✅ 2. صفحات التسويق (متاحة للجميع)
import Welcome from '../../pages/Welcome.jsx'; // ✅ إضافة .jsx
import Onboarding from '../../pages/Onboarding.jsx'; // ✅ إضافة .jsx
import Login from '../../pages/Login.jsx'; // ✅ إضافة .jsx
import AddVehicle from '../../pages/AddVehicle.jsx'; // ✅ إضافة .jsx
import About from '../../pages/About.jsx'; // ✅ إضافة .jsx

// ✅ 3. الصفحات الأساسية (تتطلب سيارة)
import Dashboard from '../../pages/Dashboard.jsx'; // ✅ إضافة .jsx
import Fuel from '../../pages/Fuel.jsx'; // ✅ إضافة .jsx
import Maintenance from '../../pages/Maintenance.jsx'; // ✅ إضافة .jsx
import Expenses from '../../pages/Expenses.jsx'; // ✅ إضافة .jsx
import Income from '../../pages/Income.jsx'; // ✅ إضافة .jsx
import Documents from '../../pages/Documents.jsx'; // ✅ إضافة .jsx
import Reminders from '../../pages/Reminders.jsx'; // ✅ إضافة .jsx
import Vehicles from '../../pages/Vehicles.jsx'; // ✅ إضافة .jsx
import More from '../../pages/More.jsx'; // ✅ إضافة .jsx

// ✅ 4. الصفحات المتقدمة (تتطلب سيارة)
import Notifications from '../../pages/Notifications.jsx'; // ✅ إضافة .jsx
import Reports from '../../pages/Reports.jsx'; // ✅ إضافة .jsx
import Timeline from '../../pages/Timeline.jsx'; // ✅ إضافة .jsx
import Valuation from '../../pages/Valuation.jsx'; // ✅ إضافة .jsx
import FuelStations from '../../pages/FuelStations.jsx'; // ✅ إضافة .jsx
import ReportPrint from '../../pages/ReportPrint.jsx'; // ✅ إضافة .jsx
import Assistance from '../../pages/Assistance.jsx'; // ✅ إضافة صفحة الإنقاذ الجديدة

// ✅ 5. الصفحات النظامية (لا تتطلب سيارة)
import Settings from '../../pages/Settings.jsx'; // ✅ إضافة .jsx
import Backup from '../../pages/Backup.jsx'; // ✅ إضافة .jsx

/* =========================================================
   ✅ الحماية (Route Guard)
   ========================================================= */
const ProtectedRoute = () => {
  const { currentCar } = useContext(AppContext);
  // إذا لم توجد سيارة، يتم التوجيه لصفحة الترحيب
  return currentCar ? <Outlet /> : <Navigate to="/welcome" replace />;
};

export default function AppRoutes() {
  const { isLoading, t } = useContext(AppContext);

  // ✅ شاشة تحميل محسنة (تمنع الوميض الأبيض)
  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center text-[var(--primary)] font-bold text-xl"
        aria-live="polite"
      >
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>{t ? t('loading') : '...'}</span>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* =========================================================
            1. المسارات العامة (لا تحتاج سيارة ولا Layout)
            ========================================================= */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        
        {/* ✅ إصلاح حرج: /add-vehicle يجب أن يكون عاماً (لإنشاء السيارة الأولى) */}
        <Route path="/add-vehicle" element={<AddVehicle />} />
        
        <Route path="/settings" element={<Settings />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/about" element={<About />} />

        {/* =========================================================
            2. المسارات المحمية (تتطلب وجود سيارة + Layout)
            ========================================================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/more" element={<More />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/valuation" element={<Valuation />} />
            <Route path="/fuel-stations" element={<FuelStations />} /> 
            <Route path="/report-print" element={<ReportPrint />} />
            {/* ✅ إضافة مسار الإنقاذ الجديد */}
            <Route path="/assistance" element={<Assistance />} />
          </Route>
        </Route>
        
        {/* =========================================================
            3. Fallback (المسارات غير الموجودة)
            ========================================================= */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
}
