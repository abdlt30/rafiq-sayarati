import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Welcome from './pages/Welcome';
import AddVehicle from './pages/AddVehicle'; 
import AddExpense from './pages/AddExpense'; // أضفنا هذه الصفحة

function App() {
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_started');
    if (saved === 'true') setIsStarted(true);
  }, []);

  const handleStart = () => {
    localStorage.setItem('app_started', 'true');
    setIsStarted(true);
  };

  return (
    <HashRouter>
      {!isStarted ? (
        <Welcome onStart={handleStart} />
      ) : (
        <Routes>
          {/* المسارات التي تحتوي على الشريط السفلي */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
          </Route>

          {/* المسارات التي تظهر بملء الشاشة (بدون شريط سفلي) */}
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/add-expense" element={<AddExpense />} />
        </Routes>
      )}
    </HashRouter>
  );
}

export default App;
