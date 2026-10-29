import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children }) => {
  const { currentCar } = useContext(AppContext);
  if (!currentCar) return <Navigate to="/welcome" replace />;
  return children;
};

export default function App() {
  const { isLoading } = useContext(AppContext);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex justify-center items-center text-brand-500 font-bold text-xl">
        جاري التحميل...
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/fuel" element={<ProtectedRoute><Layout><Fuel /></Layout></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Layout><Maintenance /></Layout></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
        <Route path="/more" element={<ProtectedRoute><Layout><More /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </HashRouter>
  );
}
