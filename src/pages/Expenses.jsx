import React, { useEffect, useState } from 'react';
import { getVehicles, getExpensesByVehicle, updateExpense, deleteExpense } from '../services/dataService';
import { Plus, Fuel, Wrench, Shield, FileText, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // حالة نافذة تأكيد الحذف
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 

  const navigate = useNavigate();

  // حالة نموذج التعديل
  const [editFormData, setEditFormData] = useState({ amount: '', type: '', date: '' });

  const loadExpenses = async () => {
    const vehs = await getVehicles();
    if (vehs.length > 0) {
      const exps = await getExpensesByVehicle(vehs[0].id);
      setExpenses(exps.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    setLoading(false);
  };

  useEffect(() => { loadExpenses(); }, []);

  // فتح نموذج التعديل
  const handleEditClick = (expense) => {
    setEditingExpense(expense.id);
    setEditFormData({ amount: expense.amount, type: expense.type, date: expense.date });
  };

  // حفظ التعديلات
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      await updateExpense(editingExpense, {
        amount: Number(editFormData.amount),
        type: editFormData.type,
        date: editFormData.date
      });
      setEditingExpense(null);
      loadExpenses();
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  // تنفيذ الحذف الفعلي
  const executeDelete = async () => {
    if (deleteConfirmId) {
      await deleteExpense(deleteConfirmId);
      setDeleteConfirmId(null);
      loadExpenses();
    }
  };

  // الحسابات
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
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">المصاريف</h1>
        <button onClick={() => navigate('/add-expense')} className="bg-brand-500 text-white p-3 rounded-full shadow-lg shadow-brand-500/30">
          <Plus size={24} />
        </button>
      </div>

      {/* المخطط الدائري */}
      {total > 0 && (
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                 style={{ background: `conic-gradient(#3b82f6 0% ${fuelPct}%, #f59e0b ${fuelPct}% ${fuelPct + maintPct}%, #10b981 ${fuelPct + maintPct}% 100%)` }}>
              <div className="absolute inset-2 bg-dark-800 rounded-full flex items-center justify-center flex-col">
                <span className="text-xs text-slate-400">الإجمالي</span>
                <span className="font-bold text-white text-sm">{total}</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2 text-slate-300"><div className="w-3 h-3 rounded-full bg-brand-500"></div> وقود</span><span className="text-white font-bold">{Math.round(fuelPct)}%</span></div>
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2 text-slate-300"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> صيانة</span><span className="text-white font-bold">{Math.round(maintPct)}%</span></div>
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2 text-slate-300"><div className="w-3 h-3 rounded-full bg-green-500"></div> تأمين</span><span className="text-white font-bold">{Math.round(insPct)}%</span></div>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المصاريف */}
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
              <div className="flex items-center gap-3">
                <p className="font-mono font-bold text-white">{exp.amount} <span className="text-xs text-slate-400">MAD</span></p>
                <div className="flex gap-1">
                  <button onClick={() => handleEditClick(exp)} className="p-2 text-slate-500 hover:text-brand-500 transition">
                    <Edit2 size={16} />
                  </button>
                  {/* زر الحذف يفتح النافذة المخصصة */}
                  <button onClick={() => setDeleteConfirmId(exp.id)} className="p-2 text-slate-500 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نموذج التعديل (Modal) */}
      {editingExpense && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 p-6 rounded-3xl w-full max-w-sm border border-dark-700 relative">
            <button onClick={() => setEditingExpense(null)} className="absolute top-4 left-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="font-bold text-white text-xl mb-4 text-center">تعديل المصروف</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">المبلغ (MAD)</label>
                <input required type="number" value={editFormData.amount} onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">النوع</label>
                <select value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white">
                  <option value="fuel">وقود</option>
                  <option value="maintenance">صيانة</option>
                  <option value="insurance">تأمين</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
                <input required type="date" value={editFormData.date} onChange={(e) => setEditFormData({...editFormData, date: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white" />
              </div>
              <button type="submit" className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition">حفظ التعديلات</button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف الاحترافية */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 p-6 rounded-3xl w-full max-w-sm border border-dark-700 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
            <p className="text-slate-400 mb-6">هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
