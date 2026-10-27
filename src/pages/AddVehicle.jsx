import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { ArrowRight, Car, Fuel, Gauge } from 'lucide-react';

export default function AddVehicle() {
  const navigate = useNavigate();
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
    try {
      await db.vehicles.add({
        ...formData,
        year: Number(formData.year),
        odometer: Number(formData.odometer)
      });
      alert('تم إضافة السيارة بنجاح!');
      navigate('/');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-dark-800 rounded-full">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-bold">إضافة سيارة جديدة</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-dark-800 p-4 rounded-2xl border border-dark-700 space-y-4">
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">اسم السيارة (مثال: كورولا)</label>
            <input required name="name" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">الماركة</label>
              <input required name="brand" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">الموديل</label>
              <input required name="model" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">السنة</label>
              <input required name="year" type="number" onChange={handleChange} value={formData.year} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">عداد الكيلومترات</label>
              <input required name="odometer" type="number" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">رقم اللوحة</label>
            <input required name="plate" type="text" onChange={handleChange} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
          </div>

        </div>

        <button type="submit" className="w-full bg-brand-500 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30">
          حفظ السيارة
        </button>
      </form>
    </div>
  );
}
