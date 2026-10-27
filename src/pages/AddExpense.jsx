import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles, addExpense } from '../services/dataService';
import { ArrowRight, Fuel, Wrench, Shield, FileText } from 'lucide-react';

export default function AddExpense() {
  const navigate = useNavigate();
  const [vehicleId, setVehicleId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'fuel',
    date: new Date().toISOString().split('T')[0],
    odometer: ''
  });

  useEffect(() => {
    const loadVehicle = async () => {
      const vehs = await getVehicles();
      if (vehs.length > 0) {
        setVehicleId(vehs[0].id);
        setFormData(prev => ({ ...prev, odometer: vehs[0].odometer }));
      }
    };
    loadVehicle();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId) return;

    try {
      await addExpense({
        vehicleId,
        amount: Number(formData.amount),
        type: formData.type,
        date: formData.date,
        odometer: Number(formData.odometer)
      });
      navigate('/expenses');
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const expenseTypes = [
    { id: 'fuel', label: 'وقود', icon: Fuel, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { id: 'maintenance', label: 'صيانة', icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 'insurance', label: 'تأمين', icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'other', label: 'أخرى', icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  ];

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-dark-800 rounded-full">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-bold">إضافة مصروف جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* حقل المبلغ (ضخم وواضح) */}
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 text-center">
          <label className="block text-sm text-gray-400 mb-2">المبلغ (MAD)</label>
          <input 
            required 
            name="amount" 
            type="number" 
            placeholder="0"
            onChange={handleChange} 
            className="w-full bg-transparent text-5xl font-bold text-white text-center outline-none placeholder-dark-700" 
          />
        </div>

        {/* اختيار النوع */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">نوع المصروف</label>
          <div className="grid grid-cols-4 gap-2">
            {expenseTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.type === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    isSelected ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700 bg-dark-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type.bg}`}>
                    <Icon size={20} className={type.color} />
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-brand-500' : 'text-gray-400'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* التاريخ والعداد */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">التاريخ</label>
            <input required name="date" type="date" value={formData.date} onChange={handleChange} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">عداد الكيلومترات</label>
            <input required name="odometer" type="number" value={formData.odometer} onChange={handleChange} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-white" />
          </div>
        </div>

        <button type="submit" className="w-full bg-brand-500 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30">
          حفظ المصروف
        </button>
      </form>
    </div>
  );
}
