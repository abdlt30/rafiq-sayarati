import React, { useEffect, useState } from 'react';
import { getVehicles, getFuelLogsByVehicle, addFuelLog, deleteFuelLog } from '../services/dataService';
import { Fuel, Plus, X, TrendingDown, Calendar, Gauge, CheckCircle } from 'lucide-react';

export default function FuelTracking() {
  const [logs, setLogs] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    liters: '',
    cost: '',
    fullTank: true // افتراضياً تعبئة كاملة
  });

  const loadData = async () => {
    const vehs = await getVehicles();
    if (vehs.length > 0) {
      setVehicle(vehs[0]);
      const data = await getFuelLogsByVehicle(vehs[0].id);
      setLogs(data.sort((a, b) => a.odometer - b.odometer)); // ترتيب تصاعدي حسب العداد
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle) return;
    try {
      await addFuelLog({
        vehicleId: vehicle.id,
        date: formData.date,
        odometer: Number(formData.odometer),
        liters: Number(formData.liters),
        cost: Number(formData.cost),
        fullTank: formData.fullTank
      });
      setShowForm(false);
      setFormData({ date: new Date().toISOString().split('T')[0], odometer: '', liters: '', cost: '', fullTank: true });
      loadData();
    } catch (error) {
      console.error("Error adding fuel log", error);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      await deleteFuelLog(deleteConfirmId);
      setDeleteConfirmId(null);
      loadData();
    }
  };

  // 🔥 خوارزمية حساب الاستهلاك (Full Tank Method)
  const calculateConsumption = () => {
    if (logs.length < 2) return null;
    
    // نبحث عن آخر تعبئة كاملة
    let lastFullIndex = -1;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].fullTank) {
        lastFullIndex = i;
        break;
      }
    }

    if (lastFullIndex <= 0) return null; // لا توجد تعبئة كاملة سابقة

    const totalDistance = logs[lastFullIndex].odometer - logs[0].odometer;
    const totalLiters = logs.slice(1, lastFullIndex + 1).reduce((sum, log) => sum + log.liters, 0);

    if (totalDistance <= 0) return null;
    return ((totalLiters / totalDistance) * 100).toFixed(2);
  };

  const avgConsumption = calculateConsumption();
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">الوقود</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-500 text-white p-3 rounded-full hover:bg-brand-600 transition shadow-lg shadow-brand-500/30">
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-dark-800 p-6 rounded-3xl border border-dark-700 w-full max-w-md space-y-5 shadow-2xl relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 left-4 p-2 bg-dark-900 rounded-full text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="font-bold text-white text-xl mb-4 text-center">إضافة تعبئة وقود</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">التاريخ</label>
                <input required name="date" type="date" value={formData.date} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">عداد الكيلومترات</label>
                <input required name="odometer" type="number" placeholder="أدخل العداد" value={formData.odometer} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">اللترات</label>
                <input required name="liters" type="number" step="0.1" placeholder="0.0" value={formData.liters} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">التكلفة (MAD)</label>
                <input required name="cost" type="number" placeholder="0" value={formData.cost} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-dark-900 p-3 rounded-xl border border-dark-700">
              <input type="checkbox" id="fullTank" name="fullTank" checked={formData.fullTank} onChange={handleChange} className="w-5 h-5 accent-brand-500" />
              <label htmlFor="fullTank" className="text-sm text-white cursor-pointer select-none">تعبئة كاملة (Full Tank)</label>
            </div>

            <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors">
              حفظ التعبئة
            </button>
          </form>
        </div>
      )}

      {/* بطاقة الإحصائيات */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-green-500" />
            <p className="text-slate-400 text-sm">متوسط الاستهلاك</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {avgConsumption ? avgConsumption : '—'} <span className="text-sm text-slate-400">L/100km</span>
          </p>
        </div>
        <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700">
          <div className="flex items-center gap-2 mb-2">
            <Fuel size={18} className="text-brand-500" />
            <p className="text-slate-400 text-sm">إجمالي تكلفة الوقود</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {totalCost.toLocaleString()} <span className="text-sm text-slate-400">MAD</span>
          </p>
        </div>
      </div>

      {/* قائمة التعبئات */}
      <div className="space-y-3">
        {logs.slice().reverse().map(log => (
          <div key={log.id} className="bg-dark-800 p-4 rounded-2xl border border-dark-700 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${log.fullTank ? 'bg-brand-500/10 text-brand-500' : 'bg-slate-500/10 text-slate-400'}`}>
                {log.fullTank ? <CheckCircle size={22} /> : <Fuel size={22} />}
              </div>
              <div>
                <p className="font-bold text-white">{log.liters} لتر {log.fullTank ? '(كاملة)' : '(جزئية)'}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Gauge size={12} /> {log.odometer.toLocaleString()} KM</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(log.date).toLocaleDateString('ar-MA')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-mono font-bold text-white">{log.cost.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">MAD</p>
              </div>
              <button onClick={() => setDeleteConfirmId(log.id)} className="p-2 text-slate-500 hover:text-red-500 transition">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة تأكيد الحذف */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 p-6 rounded-3xl w-full max-w-sm border border-dark-700 shadow-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
            <p className="text-slate-400 mb-6">هل أنت متأكد من حذف هذه التعبئة؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-dark-700 text-white py-3 rounded-xl font-bold hover:bg-dark-600 transition">إلغاء</button>
              <button onClick={executeDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
