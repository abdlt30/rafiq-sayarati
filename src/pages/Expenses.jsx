import React, { useEffect, useState } from 'react';
import { getVehicles, getExpensesByVehicle, addExpense } from '../services/dataService';
import { Plus, Fuel, Wrench, Shield, FileText, Edit2, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadExpenses = async () => {
    const vehs = await getVehicles();
    if (vehs.length > 0) {
      const exps = await getExpensesByVehicle(vehs[0].id);
      setExpenses(exps.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    setLoading(false);
  };

  useEffect(() => { loadExpenses(); }, []);

  // حسابات المخطط الدائري
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const fuelTotal = expenses.filter(e => e.type === 'fuel').reduce((s, e) => s + Number(e.amount), 0);
  const maintTotal = expenses.filter(e => e.type === 'maintenance').reduce((s, e) => s + Number(e.amount), 0);
  const insTotal = expenses.filter(e => e.type === 'insurance').reduce((s, e) => s + Number(e.amount), 0);
  
  const fuelPct = total ? (fuelTotal / total) * 100 : 0;
  const maintPct = total ? (maintTotal / total) * 100 : 0;
  const insPct = total ? (insTotal / total) * 100 : 0;

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">المصاريف</h1>
        <button onClick={() => navigate('/add-expense')} className="bg-brand-500 text-white p-3 rounded-full shadow-lg shadow-brand-500/30">
          <Plus size={24} />
        </button>
      </div>

      {/* المخطط الدائري (Donut Chart) */}
      {total > 0 && (
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700">
          <div className="flex items-center gap-6">
            {/* رسم دائري بـ CSS */}
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                 style={{ background: `conic-gradient(#3b82f6 0% ${fuelPct}%, #f59e0b ${fuelPct}% ${fuelPct + maintPct}%, #10b981 ${fuelPct + maintPct}% 100%)` }}>
              <div className="absolute inset-2 bg-dark-800 rounded-full flex items-center justify-center flex-col">
                <span className="text-xs text-slate-400">الإجمالي</span>
                <span className="font-bold text-white text-sm">{total}</span>
              </div>
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300"><div className="w-3 h-3 rounded-full bg-brand-500"></div> وقود</span>
                <span className="text-white font-bold">{Math.round(fuelPct)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> صيانة</span>
                <span className="text-white font-bold">{Math.round(maintPct)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300"><div className="w-3 h-3 rounded-full bg-green-500"></div> تأمين</span>
                <span className="text-white font-bold">{Math.round(insPct)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المصاريف */}
      {expenses.length === 0 ? (
        <div className="text-center mt-10 text-slate-400">لا توجد مصاريف مسجلة.</div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => {
            const { icon: Icon, color, bg } = getIcon(exp.type);
            return (
              <div key={exp.id} className="bg-dark-800 p-4 rounded-2xl border border-dark-700 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon size={22} className={color} />
                  </div>
                  <div>
                    <p className="font-bold text-white capitalize">{exp.type === 'fuel' ? 'وقود' : exp.type === 'maintenance' ? 'صيانة' : exp.type === 'insurance' ? 'تأمين' : 'أخرى'}</p>
                    <p className="text-xs text-slate-400">{exp.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono font-bold text-white">{exp.amount} <span className="text-xs text-slate-400">MAD</span></p>
                  {/* زر التعديل (يظهر عند التمرير أو دائماً) */}
                  <button className="p-2 text-slate-500 hover:text-brand-500 transition">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
