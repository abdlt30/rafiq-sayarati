import React, { useEffect, useState } from 'react';
import { getVehicles, getExpensesByVehicle, getMaintenanceByVehicle, getDocumentsByVehicle } from '../services/dataService';
import { Car, Gauge, Fuel, Wrench, Plus, AlertCircle, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [vehicle, setVehicle] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [alerts, setAlerts] = useState([]); // مصفوفة للتنبيهات المتعددة
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const vehs = await getVehicles();
      if (vehs.length > 0) {
        const v = vehs[0];
        setVehicle(v);
        
        // 1. حساب المصاريف
        const exps = await getExpensesByVehicle(v.id);
        const total = exps.reduce((sum, e) => sum + Number(e.amount), 0);
        setTotalExpenses(total);

        // 2. فحص التنبيهات الذكية (صيانة + وثائق)
        let currentAlerts = [];

        // فحص الزيت
        const maints = await getMaintenanceByVehicle(v.id);
        const oilChange = maints.find(m => m.service === 'تغيير الزيت');
        if (oilChange && (v.odometer - oilChange.odometer) > 5000) {
          currentAlerts.push({ type: 'maintenance', text: 'الزيت يحتاج تغييراً قريباً!', icon: Wrench, color: 'yellow' });
        }

        // فحص الوثائق
        const docs = await getDocumentsByVehicle(v.id);
        const expiringDocs = docs.filter(d => {
          const days = Math.ceil((new Date(d.endDate) - new Date()) / (1000 * 60 * 60 * 24));
          return days <= 30; // أي وثيقة تنتهي خلال 30 يوم
        });
        if (expiringDocs.length > 0) {
          currentAlerts.push({ type: 'document', text: `${expiringDocs[0].type} ينتهي قريباً!`, icon: FileText, color: 'red' });
        }

        setAlerts(currentAlerts);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="text-center mt-20 text-slate-400">جاري التحميل...</div>;
  
  if (!vehicle) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Car size={48} className="text-slate-500" />
      <h2 className="text-xl font-bold text-white">لا توجد سيارة</h2>
      <button onClick={() => navigate('/add-vehicle')} className="bg-brand-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2">
        <Plus size={20} /> إضافة سيارة جديدة
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">مرحباً، عبدو 👋</h2>
      </div>

      {/* التنبيهات الذكية */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className={`bg-${alert.color}-500/10 border border-${alert.color}-500/30 p-4 rounded-2xl flex items-center gap-3 animate-pulse`}>
                <AlertCircle className={`text-${alert.color}-500`} size={24} />
                <p className={`text-${alert.color}-500 text-sm font-bold`}>{alert.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* بطاقة السيارة */}
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
            <div className="flex items-center gap-2 text-white/90 bg-black/20 px-3 py-1.5 rounded-lg">
              <Gauge size={18} />
              <span className="font-mono">{vehicle.odometer.toLocaleString()} KM</span>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات احترافية */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full"></div>
          <p className="text-slate-400 text-sm mb-2">إجمالي المصاريف</p>
          <p className="text-3xl font-bold text-white">{totalExpenses.toLocaleString()} <span className="text-sm text-slate-400">MAD</span></p>
          <Link to="/expenses" className="text-brand-500 text-xs font-bold mt-2 block hover:underline">عرض التفاصيل &larr;</Link>
        </div>
        
        <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full"></div>
          <p className="text-slate-400 text-sm mb-2">تكلفة الكيلومتر</p>
          <p className="text-3xl font-bold text-white">
            {totalExpenses > 0 ? (totalExpenses / vehicle.odometer).toFixed(2) : '0.00'} <span className="text-sm text-slate-400">MAD</span>
          </p>
        </div>
      </div>

      {/* إجراءات سريعة */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/add-expense" className="bg-dark-800 border border-dark-700 p-4 rounded-2xl flex items-center gap-3 hover:bg-dark-700 transition">
            <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
              <Fuel size={20} className="text-brand-500" />
            </div>
            <span className="text-sm font-bold text-white">إضافة مصروف</span>
          </Link>
          <Link to="/maintenance" className="bg-dark-800 border border-dark-700 p-4 rounded-2xl flex items-center gap-3 hover:bg-dark-700 transition">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Wrench size={20} className="text-yellow-500" />
            </div>
            <span className="text-sm font-bold text-white">إضافة صيانة</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
