import React, { useEffect, useState } from 'react';
import { getVehicles, getExpensesByVehicle } from '../services/dataService';
import { Plus, Fuel, Wrench, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      const vehs = await getVehicles();
      if (vehs.length > 0) {
        const exps = await getExpensesByVehicle(vehs[0].id);
        setExpenses(exps.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      setLoading(false);
    };
    loadExpenses();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'fuel': return { icon: Fuel, color: 'text-brand-500', bg: 'bg-brand-500/10' };
      case 'maintenance': return { icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      case 'insurance': return { icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10' };
      default: return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  if (loading) return <div className="text-center mt-20 text-slate-400">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">المصاريف</h1>
        <Link to="/add-expense" className="bg-brand-500 text-white p-3 rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition">
          <Plus size={24} />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center mt-20 space-y-4">
          <p className="text-slate-400">لا توجد مصاريف مسجلة بعد.</p>
          <Link to="/add-expense" className="inline-block bg-dark-800 border border-dark-700 text-brand-500 font-bold py-3 px-6 rounded-xl hover:bg-dark-700 transition">
            إضافة أول مصروف
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => {
            const { icon: Icon, color, bg } = getIcon(exp.type);
            return (
              <div key={exp.id} className="bg-dark-800 p-4 rounded-2xl border border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon size={24} className={color} />
                  </div>
                  <div>
                    <p className="font-bold text-white capitalize">
                      {exp.type === 'fuel' ? 'وقود' : exp.type === 'maintenance' ? 'صيانة' : exp.type === 'insurance' ? 'تأمين' : 'أخرى'}
                    </p>
                    <p className="text-xs text-slate-400">{exp.date}</p>
                  </div>
                </div>
                <p className="font-mono font-bold text-xl text-white">{exp.amount} <span className="text-sm text-slate-400">MAD</span></p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
