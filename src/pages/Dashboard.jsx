// في أعلى الملف تأكد من استدعاء كل هذه الأيقونات
import { Wallet, Gauge, Fuel, Wrench, Car, FileText, Bell, Settings, ChevronLeft, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentCar, currency, t } = useContext(AppContext); // أضفنا currency
  const navigate = useNavigate();
  // ... باقي الحالات (totals, recent, etc.)

  // ... باقي دوال useEffect

  return (
    <div className="space-y-4 pb-24">
      
      {/* 1. الشريط العلوي (تم تثبيته) */}
      <div className="sticky top-0 z-50 bg-[var(--bg)] pt-2 pb-2 -mx-4 px-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{t('welcome')} عبدو 👋</h2>
          <p className="text-xs text-[var(--text-muted)]">{new Date().toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/notifications')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] relative">
            <Bell size={18} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={() => navigate('/settings')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)]"><Settings size={18} /></button>
        </div>
      </div>

      {/* ... باقي البطاقات (Hero, Quick Actions, KPIs) */}
      
      {/* تحديث العملة في لوحة البيانات */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('totalCost')}</span>
          <span className="text-lg font-bold">{totalCost} <span className="text-xs">{currency}</span></span> {/* استخدام العملة */}
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('costPerKm')}</span>
          <span className="text-lg font-bold">{costPerKm} <span className="text-xs">{currency}</span></span>
        </div>
        {/* ... */}
      </div>
    </div>
  );
}
