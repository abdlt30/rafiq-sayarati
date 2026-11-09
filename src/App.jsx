import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Layout from './components/layout/Layout';

// ... الاستيرادات السابقة
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Resale from './pages/Resale';
import Timeline from './pages/Timeline';

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
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        
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
            
            {/* ✅ المسارات الجديدة */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/resale" element={<Resale />} />
            <Route path="/timeline" element={<Timeline />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
}
