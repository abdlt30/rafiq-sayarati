import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';

// ✅ 1. الهيكل الجديد (shared)
import Layout from './shared/components/layout/Layout';

// ✅ 2. صفحات التسويق (متاحة للجميع)
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import AddVehicle from './pages/AddVehicle';
import About from './pages/About'; 

// ✅ 3. الصفحات الأساسية (تتطلب سيارة)
import Dashboard from './pages/Dashboard';
import Fuel from './pages/Fuel';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Income from './pages/Income'; 
import Documents from './pages/Documents'; 
import Reminders from './pages/Reminders'; 
import Vehicles from './pages/Vehicles';
import More from './pages/More';

// ✅ 4. الصفحات المتقدمة (تتطلب سيارة)
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Timeline from './pages/Timeline';
import Valuation from './pages/Valuation'; 
import FuelStations from './pages/FuelStations'; 
import ReportPrint from './pages/ReportPrint'; 

// ✅ 5. الصفحات النظامية (لا تتطلب سيارة)
import Settings from './pages/Settings'; 
import Backup from './pages/Backup'; 

/* =========================================================
   ✅ الحماية (Route Guard)
   ========================================================= */
const ProtectedRoute = () => {
  const { currentCar } = useContext(AppContext);
  // إذا لم توجد سيارة، يتم التوجيه لصفحة الترحيب
  return currentCar ? <Outlet /> : <Navigate to="/welcome" replace />;
};

export default function App() {
  const { isLoading, t } = useContext(AppContext);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-[var(--bg)] flex justify-center items-center text-[var(--primary)] font-bold text-xl"
        aria-live="polite" // ✅ تحسين الوصولية: إخبار قارئ الشاشة بحالة التحميل
      >
        {t ? t('loading') : '...'}
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
