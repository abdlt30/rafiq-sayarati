import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Layout from './components/layout/Layout';

import Dashboard from './pages/Dashboard';
import Fuel from './pages/Fuel';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import More from './pages/More';
import Welcome from './pages/Welcome';
import AddVehicle from './pages/AddVehicle';
import Settings from './pages/Settings';
import Documents from './pages/Documents'; 
import Reminders from './pages/Reminders'; 
import Backup from './pages/Backup'; 
import Vehicles from './pages/Vehicles';

// مكون حماية المسارات (تم تعديله ليعمل مع المسارات المتداخلة)
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
        {/* مسارات عامة لا تحتاج سيارة */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        
        {/* 🚨 المسارات المحمية والمتداخلة (السر يكمن هنا) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/more" element={<More />} />
          </Route>
        </Route>
        
        {/* إعادة التوجيه لأي مسار غير معروف */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
}
