import React, { useEffect, useState } from 'react';
import { getVehicles, getMaintenanceByVehicle, addMaintenance } from '../services/dataService';
import { Wrench, Plus, Calendar, Gauge } from 'lucide-react';

export default function Maintenance() {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // حالة النموذج
  const [formData, setFormData] = useState({
    service: 'تغيير الزيت',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    odometer: ''
  });

  const loadData = async () => {
    const vehs = await getVehicles();
    if (vehs.length > 0) {
      setVehicleId(vehs[0].id);
      setFormData(prev => ({ ...prev, odometer: vehs[0].odometer }));
      const list = await getMaintenanceByVehicle(vehs[0].id);
      // ترتيب حسب التاريخ من الأحدث للأقدم
      setMaintenanceList(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        odometer: Number(formData.odometer)
      });
      setShowForm(false);
      setFormData({ ...formData, cost: '' }); // تصفير التكلفة فقط
      loadData(); // إعادة تحميل القائمة فوراً
    } catch (error) {
      console.error("Error adding maintenance", error);
    }
  };

  // دالة لتنسيق التاريخ بشكل مقروء (مثال: 27 أكتوبر 2026)
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-MA', options);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">الصيانة</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-brand-500 text-white p-3 rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all active:scale-95"
        >
          <Plus size={24} className={showForm ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {/* نموذج الإضافة الأنيق */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 p-5 rounded-3xl border border-dark-700 space-y-4 shadow-xl mb-6">
          <h3 className="font-bold text-white text-lg">إضافة صيانة جديدة</h3>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">نوع الخدمة</label>
            <select name="service" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500">
              <option value="تغيير الزيت">تغيير الزيت</option>
              <option value="فحص الفرامل">فحص الفرامل</option>
              <option value="تغيير الإطارات">تغيير الإطارات</option>
              <option value="فحص شامل">فحص شامل</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">التاريخ</label>
              <input name="date" type="date" value={formData.date} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">التكلفة (MAD)</label>
              <input required name="cost" type="number" placeholder="0" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">عداد الكيلومترات</label>
            <input required name="odometer" type="number" value={formData.odometer} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" />
          </div>

          <button type="submit" className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors">
            حفظ الصيانة
          </button>
        </form>
      )}

      {/* قائمة الصيانة */}
      {maintenanceList.length === 0 ? (
        <div className="text-center mt-20 flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center">
            <Wrench size={32} className="text-slate-600" />
          </div>
          <p className="text-slate-400">لا توجد سجلات صيانة بعد.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenanceList.map(item => (
            <div key={item.id} className="bg-dark-800 p-4 rounded-2xl border border-dark-700 flex items-center justify-between hover:border-yellow-500/30 transition-colors">
              <div className="flex items-center gap-4">
                {/* أيقونة موحدة باللون الأصفر */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/10">
                  <Wrench size={22} className="text-yellow-500" />
                </div>
                
                {/* تفاصيل البطاقة */}
                <div>
                  <p className="font-bold text-white text-base">{item.service}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(item.date)}</span>
                    <span className="flex items-center gap-1"><Gauge size={13} /> {item.odometer.toLocaleString()} KM</span>
                  </div>
                </div>
              </div>
              
              {/* التكلفة */}
              <div className="text-right">
                <p className="font-mono font-bold text-white text-lg">{item.cost.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">MAD</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
