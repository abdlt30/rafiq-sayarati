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

export default function App() {
  const { currentCar, isLoading } = useContext(AppContext);
  const hasCar = currentCar !== null; 

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

        <Route path="/" element={hasCar ? <Layout><Dashboard /></Layout> : <Navigate to="/welcome" />} />
        <Route path="/fuel" element={<Layout><Fuel /></Layout>} />
        <Route path="/maintenance" element={<Layout><Maintenance /></Layout>} />
        <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
        <Route path="/more" element={<Layout><More /></Layout>} />
      </Routes>
    </HashRouter>
  );
}
