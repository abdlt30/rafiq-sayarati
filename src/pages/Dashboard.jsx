import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Wallet, Gauge, Fuel, Wrench, Car, FileText, Bell, Settings, ChevronLeft, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  // 1. جلب البيانات الأساسية من الـ Context
  const { currentCar, currency, t, lang } = useContext(AppContext); 
  const navigate = useNavigate();

  // 2. تعريف الحالات (States) التي كانت ناقصة
  const [totalCost, setTotalCost] = useState(0);
  const [costPerKm, setCostPerKm] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

  // 3. دالة لحساب الإجماليات عند تحميل الصفحة أو تغيير السيارة
  useEffect(() => {
    if (currentCar) {
      // جلب السجلات من قاعدة البيانات
      const fuelRecords = dbService.getFuel().filter(r => r.carId === currentCar.id);
      const expenseRecords = dbService.getExpenses().filter(r => r.carId === currentCar.id);
      const maintenanceRecords = dbService.getMaintenance().filter(r => r.carId === currentCar.id);

      // حساب إجمالي التكاليف
      const fuelCost = fuelRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
      const expensesCost = expenseRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
      const maintenanceCost = maintenanceRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

      const grandTotal = fuelCost + expensesCost + maintenanceCost;
      setTotalCost(grandTotal);

      // حساب المسافة المقطوعة بناءً على عدادات الوقود
      const odometers = fuelRecords.map(r => Number(r.odometer)).filter(o => o > 0).sort((a, b) => a - b);
      let distance = 0;
      
      if (odometers.length > 1) {
        distance = odometers[odometers.length - 1] - odometers[0];
      } else if (odometers.length === 1 && currentCar.currentOdometer) {
        distance = Math.max(0, currentCar.currentOdometer - odometers[0]);
      }
      setTotalDistance(distance);

      // حساب تكلفة الكيلومتر
      if (distance > 0) {
        setCostPerKm((grandTotal / distance).toFixed(2));
      } else {
        setCostPerKm(0);
      }
    }
  }, [currentCar]);

  // دالة لجلب التاريخ حسب اللغة الحالية
  const getFormattedDate = () => {
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Date().toLocaleDateString(localeMap[lang] || 'ar-MA', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* 1. الشريط العلوي */}
      <div className="sticky top-0 z-50 bg-[var(--bg)] pt-2 pb-2 -mx-4 px-4 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">{t('welcome') || 'مرحباً،'} 👋</h2>
          <p className="text-xs text-[var(--text-muted)]">{getFormattedDate()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/reminders')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] relative">
            <Bell size={18} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={() => navigate('/settings')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)]"><Settings size={18} /></button>
        </div>
      </div>

      {/* 2. بطاقة السيارة الحالية (Hero Card) */}
      <div className="hero-card p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">{t('currentCar') || 'السيارة الحالية'}</p>
            <h3 className="text-2xl font-bold text-[var(--text)]">{currentCar?.make} {currentCar?.model}</h3>
            <p className="text-sm opacity-80 mt-1">{currentCar?.plate}</p>
          </div>
          <Car size={32} className="opacity-50" />
        </div>
      </div>
      
      {/* 3. إحصائيات المصاريف (KPIs) */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
            <Wallet size={16} />
            <span className="text-xs">{t('totalCost') || 'إجمالي المصاريف'}</span>
          </div>
          <span className="text-xl font-bold text-[var(--text)]">
            {totalCost} <span className="text-sm font-normal">{currency}</span>
          </span>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
            <Gauge size={16} />
            <span className="text-xs">{t('costPerKm') || 'تكلفة الكيلومتر'}</span>
          </div>
          <span className="text-xl font-bold text-[var(--text)]">
            {costPerKm} <span className="text-sm font-normal">{currency}</span>
          </span>
        </div>
      </div>

      {/* 4. المسافة المقطوعة */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <Gauge size={20} />
          </div>
          <span className="text-sm font-medium text-[var(--text)]">{t('distance') || 'المسافة المقطوعة'}</span>
        </div>
        <span className="font-bold text-[var(--text)]">{totalDistance} KM</span>
      </div>
      
    </div>
  );
}
