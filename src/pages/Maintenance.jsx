import React, { useEffect, useState } from 'react';
import { getVehicles, getMaintenanceByVehicle, addMaintenance } from '../services/dataService';
import { Wrench, Plus, Calendar, Gauge, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Maintenance() {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

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
    await addMaintenance({
      vehicleId,
      service: formData.service,
      date: formData.date,
      cost: Number(formData.cost),
      odometer: Number(formData.odometer)
    });
    setShowForm(false);
    loadData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">الصيانة</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-500 text-white p-3 rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition">
          <Plus size={24} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 p-4 rounded-3xl border border-dark-700 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-white mb-2">إضافة صيانة جديدة</h3>
          <div>
            <label className="block text-sm text-slate-400 mb-1">نوع الخدمة</label>
            <select name="service" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none">
              <option value="تغيير الزيت">تغيير الزيت</option>
              <option value="فحص الفرامل">فحص الفرامل</option>
              <option value="تغيير الإطارات">تغيير الإطارات</option>
              <option value="فحص شامل">فحص شامل</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
              <input name="date" type="date" value={formData.date} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">التكلفة (MAD)</label>
              <input required name="cost" type="number" placeholder="0" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">عداد الكيلومترات</label>
            <input required name="odometer" type="number" value={formData.odometer} onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none" />
          </div>
          <button type="submit" className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition">حفظ الصيانة</button>
        </form>
      )}

      {maintenanceList.length === 0 ? (
        <div className="text-center mt-20 text-slate-400">لا توجد سجلات صيانة بعد.</div>
      ) : (
        <div className="space-y-3">
          {maintenanceList.map(item => (
            <div key={item.id} className="bg-dark-800 p-4 rounded-2xl border border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/10">
                  <Wrench size={24} className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-bold text-white">{item.service}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                    <span className="flex items-center gap-1"><Gauge size={12} /> {item.odometer} KM</span>
                  </div>
                </div>
              </div>
              <p className="font-mono font-bold text-white">{item.cost} <span className="text-sm text-slate-400">MAD</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
