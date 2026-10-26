import React, { useEffect, useState } from 'react';
import { getVehicles, getExpensesByVehicle, addExpense } from '../services/dataService';
import { Plus } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('fuel');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadExpenses = async () => {
    const vehs = await getVehicles();
    if (vehs.length > 0) {
      setVehicleId(vehs[0].id);
      const exps = await getExpensesByVehicle(vehs[0].id);
      setExpenses(exps.sort((a,b) => new Date(b.date) - new Date(a.date)));
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !vehicleId) return;

    await addExpense({
      vehicleId,
      amount: Number(amount),
      type,
      date,
      notes: 'إضافة سريعة'
    });

    setAmount('');
    setShowForm(false);
    loadExpenses();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">سجل المصاريف</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-500 p-2 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-brand-600"
        >
          <Plus size={16} /> إضافة
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 p-4 rounded-xl border border-dark-700 space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">المبلغ (MAD)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">النوع</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white">
              <option value="fuel">وقود</option>
              <option value="maintenance">صيانة</option>
              <option value="repair">إصلاح</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">التاريخ</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2 text-white" />
          </div>
          <button type="submit" className="w-full bg-brand-500 py-2 rounded-lg font-bold hover:bg-brand-600">حفظ</button>
        </form>
      )}

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">لا توجد مصاريف مسجلة بعد.</p>
        ) : (
          expenses.map(exp => (
            <div key={exp.id} className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex justify-between items-center">
              <div>
                <p className="font-bold">{exp.type === 'fuel' ? 'وقود' : exp.type === 'maintenance' ? 'صيانة' : 'أخرى'}</p>
                <p className="text-xs text-gray-400">{exp.date}</p>
              </div>
              <p className="font-mono font-bold text-red-400">{exp.amount} MAD</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
