import React, { useEffect, useState } from 'react';
import { getVehicles, getExpensesByVehicle } from '../services/dataService';
import { Car, Gauge, Fuel, Wrench, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [vehicle, setVehicle] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const vehs = await getVehicles();
      if (vehs.length > 0) {
        const v = vehs[0];
        setVehicle(v);
        const exps = await getExpensesByVehicle(v.id);
        const total = exps.reduce((sum, e) => sum + Number(e.amount), 0);
        setTotalExpenses(total);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="text-center mt-20 text-slate-400">جاري التحميل...</div>;

  // إذا لم توجد سيارة، اعرض شاشة فارغة
  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center">
          <Car size={48} className="text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white">لا توجد سيارة</h2>
        <p className="text-slate-400 text-center max-w-xs">أضف سيارتك الأولى لتبدأ بتتبع المصاريف والصيانة.</p>
        <button 
          onClick={() => navigate('/add-vehicle')}
          className="bg-brand-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-brand-600 transition"
        >
          <Plus size={20} /> إضافة سيارة جديدة
        </button>
      </div>
    );
  }

  // ... (باقي كود لوحة التحكم الذي كتبناه سابقاً يبقى كما هو)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">مرحباً، عبدو 👋</h2>
      </div>

      <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{vehicle.name}</h2>
              <p className="text-blue-100 text-sm">{vehicle.plate}</p>
            </div>
            <Car size={48} className="text-white/30" />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-white/90">
              <Gauge size={18} />
              <span className="font-mono">{vehicle.odometer.toLocaleString()} KM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
            <Fuel size={20} className="text-red-400" />
          </div>
          <p className="text-slate-400 text-sm mb-1">إجمالي المصاريف</p>
          <p className="text-2xl font-bold text-white">{totalExpenses.toLocaleString()} <span className="text-sm text-slate-400">MAD</span></p>
        </div>
        <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3">
            <Wrench size={20} className="text-yellow-400" />
          </div>
          <p className="text-slate-400 text-sm mb-1">تكلفة الكيلومتر</p>
          <p className="text-2xl font-bold text-white">
            {totalExpenses > 0 ? (totalExpenses / vehicle.odometer).toFixed(2) : '0.00'} <span className="text-sm text-slate-400">MAD</span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">إجراءات سريعة</h3>
        <div className="flex gap-3">
          <Link to="/expenses" className="flex-1 bg-dark-800 border border-dark-700 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-dark-700 transition">
            <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
              <Fuel size={20} className="text-brand-500" />
            </div>
            <span className="text-sm font-medium text-white">إضافة وقود</span>
          </Link>
          <button className="flex-1 bg-dark-800 border border-dark-700 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-dark-700 transition opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Wrench size={20} className="text-yellow-500" />
            </div>
            <span className="text-sm font-medium text-white">صيانة (قريباً)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
