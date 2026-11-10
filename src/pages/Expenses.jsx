import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wallet } from 'lucide-react';
import OptionPicker from '../components/ui/OptionPicker';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Expenses() {
  const { currentCar, t, currency } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState({ date: '', type: 'insurance', cost: '' });

  const expenseTypes = [
    { value: 'insurance', label: t('insurance') || 'تأمين' },
    { value: 'taxes', label: t('taxes') || 'ضرائب' },
    { value: 'carWash', label: t('carWash') || 'غسيل' },
    { value: 'fines', label: t('fines') || 'مخالفات مرورية' },
    { value: 'parking', label: t('parking') || 'رسوم مواقف' },
    { value: 'other', label: t('other') || 'أخرى' }
  ];

  // ✅ دالة موحدة لجلب البيانات وترتيبها
  const loadData = () => {
    if (currentCar) {
      const allExpenses = dbService.getExpenses() || [];
      const carExpenses = allExpenses.filter(r => r.carId === currentCar.id);
      setRecords(carExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setRecords([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentCar) return;

    try {
      const data = { 
        carId: currentCar.id, 
        date: formData.date,
        type: formData.type,
        cost: Number(formData.cost) 
      };
      
      if (editingId) {
        dbService.updateExpense(editingId, data);
      } else {
        dbService.addExpense(data);
      }
      
      // ✅ إعادة جلب البيانات لضمان التحديث الفوري للواجهة
      loadData(); 
      closeModal();
    } catch (error) {
      console.error("خطأ في حفظ المصروف:", error);
      alert("حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleDelete = () => {
    if(deleteId) {
      dbService.deleteExpense(deleteId);
      loadData(); // تحديث الواجهة بعد الحذف
      setDeleteId(null);
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, type: record.type, cost: record.cost });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'insurance', cost: '' });
  };

  const total = records.reduce((sum, r) => sum + Number(r.cost || 0), 0);

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('expenses') || 'المصاريف'}</h1>
      </div>

      {/* بطاقة الإجمالي */}
      <div className="bg-gradient-to-br from-[var(--primary)]/10 to-transparent border border-[var(--primary)]/20 p-4 rounded-2xl mb-2">
        <span className="text-xs text-[var(--text-muted)] block mb-1">{t('totalCost') || 'إجمالي المصاريف'}</span>
        <span className="text-2xl font-extrabold text-[var(--text)]">
          {total.toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{currency}</span>
        </span>
      </div>

      {/* القائمة */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4"><Wallet size={48} className="opacity-40" /></div>
          <p>{t('noExpenses') || 'لا توجد مصاريف مسجلة.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl flex items-center justify-between shadow-sm hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-[var(--text)] font-bold text-sm">
                    {Number(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {record.date} • {t(record.type) !== record.type ? t(record.type) : (expenseTypes.find(e => e.value === record.type)?.label || record.type)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(record)} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-md hover:bg-blue-500/20"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-md hover:bg-red-500/20"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* الزر العائم */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 transition-transform z-40">
        <Plus size={28} />
      </button>

      {/* نافذة الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء.'}
      />

      {/* نافذة الإضافة/التعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white z-10"><X size={20} /></button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">{editingId ? 'تعديل مصروف' : 'إضافة مصروف'}</h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">التاريخ</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>
              
              <OptionPicker 
                label={t('expenseType') || 'نوع المصروف'} 
                options={expenseTypes} 
                value={formData.type} 
                onChange={(val) => setFormData({...formData, type: val})} 
              />

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('amount') || 'المبلغ'} ({currency})</label>
                <input type="number" step="0.01" required placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
            <button type="submit" className="w-full mt-5 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-600 transition-colors">
              {t('save') || 'حفظ'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
