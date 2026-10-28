import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Layout from './components/layout/Layout';

// استدعاء الصفحات (تأكد أن هذه الملفات موجودة في مجلد pages)
import Dashboard from './pages/Dashboard';
import Fuel from './pages/Fuel';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import More from './pages/More';
import Welcome from './pages/Welcome';

export default function App() {
  const { currentCar } = useContext(AppContext);

  // إذا لم تكن هناك سيارة مسجلة، التطبيق يحولك لصفحة الترحيب
  // (سنستخدم سيارة وهمية مؤقتاً للتجربة إذا كنت تريد رؤية الصفحات)
  const hasCar = currentCar !== null; 

  return (
    <BrowserRouter>
      <Routes>
        {/* صفحة الترحيب (بدون Layout) */}
        <Route path="/welcome" element={<Welcome />} />

        {/* باقي الصفحات (داخل الـ Layout) */}
        <Route path="/" element={hasCar ? <Layout><Dashboard /></Layout> : <Navigate to="/welcome" />} />
        <Route path="/fuel" element={<Layout><Fuel /></Layout>} />
        <Route path="/maintenance" element={<Layout><Maintenance /></Layout>} />
        <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
        <Route path="/more" element={<Layout><More /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
