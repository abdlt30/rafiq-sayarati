import React, { useEffect, useState } from 'react';
import { getVehicles, getMaintenanceByVehicle, addMaintenance } from '../services/dataService';
import { Wrench, Plus, Calendar, Gauge, X } from 'lucide-react';

export default function Maintenance() {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    service: 'تغيير الزيت',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    odometer: '' // نتركه فارغاً ليبدأ المستخدم بالكتابة
  });

  const services = [
    { id: 'تغيير الزيت', label: 'تغيير الزيت', icon: '🛢️' },
    { id: 'فحص الفرامل', label: 'فحص الفرامل', icon: '🛑' },
    { id: 'تغيير الإطارات', label: 'تغيير الإطارات', icon: '🛞' },
    { id: 'فحص شامل', label: 'فحص شامل', icon: '🔍' },
  ];

  const loadData = async () => {
    const vehs = await getVehicles();
    if (vehs.length > 0) {
      setVehicleId(vehs[0].id);
      // لا نضع العداد في النموذج تلقائياً لتجنب الأخطاء
      const list = await getMaintenanceByVehicle(vehs[0].id);
      setMaintenanceList(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId) return;
    try {
      await addMaintenance({
        vehicleId,
        service: formData.service,
        date: formData.date,
        cost: Number(formData.cost),
        odometer: Number(formData.odometer) // هنا سيقرأ الرقم الذي كتبه المستخدم فقط
      });
      setShowForm(false);
      setFormData({ ...formData, cost: '', odometer: '' }); // تصفير الحقول
      loadData();
    } catch (error) {
      console.error("Error adding maintenance", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-4 animate-in fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">الصيانة</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-500 text-white p-3 rounded-full hover:bg-brand-600 transition">
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
          <form onSubmit={handleSubmit} className="bg-dark-800 p-6 rounded-3xl border border-dark-700 w-full max-w-md space-y-5 shadow-2xl relative">
            {/* زر إغلاق واضح في النموذج */}
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 left-4 p-2 bg-dark-900 rounded-full text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <h3 className="font-bold text-white text-xl mb-4 text-center">إضافة صيانة جديدة</h3>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">نوع الخدمة</label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((srv) => (
                  <button key={srv.id} type="button" onClick={() => setFormData({ ...formData, service: srv.id })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                      formData.service === srv.id ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-dark-700 bg-dark-900 text-slate-400'
                    }`}>
                    <span>{srv.icon}</span><span className="text-sm font-medium">{srv.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">التاريخ</label>
                <input name="date" type="date" value={formData.date} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">التكلفة (MAD)</label>
                <input required name="cost" type="number" placeholder="0" value={formData.cost} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">عداد الكيلومترات</label>
              <input required name="odometer" type="number" placeholder="أدخل العداد الحالي" value={formData.odometer} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
            </div>

            <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors">
              حفظ الصيانة
            </button>
          </form>
        </div>
      )}

      {/* قائمة الصيانة */}
      {maintenanceList.length === 0 ? (
        <div className="text-center mt-20"><Wrench size={40} className="mx-auto text-slate-600 mb-4" /><p className="text-slate-400">لا توجد سجلات صيانة.</p></div>
      ) : (
        <div className="space-y-3">
          {maintenanceList.map(item => (
            <div key={item.id} className="bg-dark-800 p-4 rounded-2xl border border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/10">
                  <Wrench size={22} className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-bold text-white">{item.service}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{formatDate(item.date)}</span>
                    <span>{item.odometer.toLocaleString()} KM</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-white">{item.cost.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">MAD</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
