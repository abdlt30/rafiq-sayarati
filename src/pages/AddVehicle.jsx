import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. استدعاء الوسيط، وليس قاعدة البيانات مباشرة
import { addVehicle } from '../services/dataService';
import { ArrowRight, Car } from 'lucide-react';

export default function AddVehicle() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    odometer: 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 2. استخدام الوسيط بدلاً من db.vehicles.add
      await addVehicle({
        ...formData,
        year: Number(formData.year),
        odometer: Number(formData.odometer)
      });
      
      // 3. الانتقال المباشر بدون alert (تجربة مستخدم أفضل)
      navigate('/');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-dark-800 rounded-full text-white hover:bg-dark-700 transition">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">إضافة سيارة جديدة</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700 space-y-5">
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">اسم السيارة (مثال: كورولا)</label>
            <input required name="name" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">الماركة</label>
              <input required name="brand" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">الموديل</label>
              <input required name="model" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">السنة</label>
              <input required name="year" type="number" onChange={handleChange} value={formData.year} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">عداد الكيلومترات الحالي</label>
              <input required name="odometer" type="number" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">رقم اللوحة</label>
            <input required name="plate" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none transition" />
          </div>

        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand-500 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50"
        >
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ السيارة'}
        </button>
      </form>
    </div>
  );
}
