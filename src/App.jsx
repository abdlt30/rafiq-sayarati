import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Layout from './components/layout/Layout';

// ✅ استيراد صفحات التسويق والدخول (Marketing Funnel)
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import AddVehicle from './pages/AddVehicle';

// ✅ استيراد الصفحات المحمية (Core App)
import Dashboard from './pages/Dashboard';
import Fuel from './pages/Fuel';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import More from './pages/More';
import Settings from './pages/Settings';
import Documents from './pages/Documents'; 
import Reminders from './pages/Reminders'; 
import Backup from './pages/Backup'; 
import Vehicles from './pages/Vehicles';

// ✅ استيراد الصفحات الجديدة (Advanced Features)
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Resale from './pages/Resale';
import Timeline from './pages/Timeline';

// مكون حماية المسارات: لا يسمح بالدخول إلا إذا كانت هناك سيارة مضافة
const ProtectedRoute = () => {
  const { currentCar } = useContext(AppContext);
  return currentCar ? <Outlet /> : <Navigate to="/welcome" replace />;
};

export default function App() {
  const { isLoading } = useContext(AppContext);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex justify-center items-center text-[var(--primary)] font-bold text-xl">
        جاري التحميل...
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* 🌟 1. المسارات العامة (رحلة المستخدم قبل إضافة السيارة) */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        
        {/* 🌟 2. المسارات المحمية (التطبيق الفعلي بعد إضافة السيارة) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* الرئيسية */}
            <Route path="/" element={<Dashboard />} />
            
            {/* إدارة السيارات */}
            <Route path="/vehicles" element={<Vehicles />} />
            
            {/* السجلات الأساسية */}
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reminders" element={<Reminders />} />
            
            {/* الميزات المتقدمة (Micro-SaaS Features) */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/resale" element={<Resale />} />
            <Route path="/timeline" element={<Timeline />} />
            
            {/* الإعدادات والمزيد */}
            <Route path="/more" element={<More />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/backup" element={<Backup />} />
          </Route>
        </Route>
        
        {/* إعادة التوجيه الافتراضية */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
}
