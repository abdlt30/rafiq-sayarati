import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
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
  const [error, setError] = useState(null);

  // التقاط أي خطأ وعرضه على الشاشة
  useEffect(() => {
    const handleError = (event) => {
      setError(event.error ? event.error.message : "حدث خطأ غير معروف في التطبيق");
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white p-6 flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold mb-4">عذراً، حدث خطأ!</h1>
        <p className="bg-black/50 p-4 rounded text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 bg-white text-red-900 px-6 py-2 rounded font-bold">إعادة المحاولة</button>
      </div>
    );
  }

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
