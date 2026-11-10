import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, TrendingUp } from 'lucide-react';
import OptionPicker from '../components/ui/OptionPicker';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Income() {
  const { currentCar, t, currency } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState({ date: '', type: 'ride', amount: '', notes: '' });

  // أنواع الإيرادات (يمكنك توسيعها لاحقاً)
  const incomeTypes = [
    { value: 'ride', label: t('rideIncome') || 'رحلات / توصيل' },
    { value: 'rental', label: t('rentalIncome') || 'تأجير السيارة' },
    { value: 'delivery', label: t('deliveryIncome') || 'توصيل طرود' },
    { value: 'other', label: t('otherIncome') || 'إيراد آخر' }
  ];

  const loadData = () => {
    if (currentCar) {
      // جلب الإيرادات الخاصة بهذه السيارة
      const allIncomes = dbService.getIncomes() || [];
      const carIncomes = allIncomes.filter(r => r.carId === currentCar.id);
      setRecords(carIncomes.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setRecords([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCar]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      type: 'ride', 
      amount: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentCar) return;

    try {
      const data = { 
        carId: currentCar.id, 
        date: formData.date,
        type: formData.type,
        amount: Number(formData.amount),
        notes: formData.notes
      };
      
      if (editingId) {
        dbService.updateIncome(editingId, data);
      } else {
        dbService.addIncome(data);
      }
      
      loadData(); 
      closeModal();
    } catch (error) {
      console.error("خطأ في حفظ الإيراد:", error);
      alert("حدث خطأ أثناء الحفظ.");
    }
  };

  const handleDelete = () => {
    if(deleteId) {
      dbService.deleteIncome(deleteId);
      loadData(); 
      setDeleteId(null);
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, type: record.type, amount: record.amount, notes: record.notes || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'ride', amount: '', notes: '' });
  };

  const total = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('income') || 'الإيرادات'}</h1>
      </div>

      {/* بطاقة الإجمالي (باللون الأخضر) */}
      <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-4 rounded-2xl mb-2">
        <span className="text-xs text-[var(--text-muted)] block mb-1">{t('totalIncome') || 'إجمالي الإيرادات'}</span>
        <span className="text-2xl font-extrabold text-green-500">
          {total.toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{currency}</span>
        </span>
      </div>

      {/* القائمة */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4"><TrendingUp size={48} className="opacity-40" /></div>
          <p>{t('noIncome') || 'لا توجد إيرادات مسجلة.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-green-500 font-bold text-sm">
                    + {Number(record.amount).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {record.date} • {incomeTypes.find(e => e.value === record.type)?.label || record.type}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(record)} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* الزر العائم */}
      <button onClick={openAddModal} className="fixed bottom-24 right-6 rtl:left-6 rtl:auto w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <Plus size={28} />
      </button>

      {/* نافذة الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف هذا الإيراد؟'}
        variant="danger" 
        confirmText="نعم، احذف" 
      />

      {/* نافذة الإضافة/التعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white active:scale-90 transition-all z-10"><X size={20} /></button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">{editingId ? 'تعديل إيراد' : 'إضافة إيراد'}</h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">التاريخ</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-green-500" />
              </div>
              
              <OptionPicker 
                label={t('incomeType') || 'نوع الإيراد'} 
                options={incomeTypes} 
                value={formData.type} 
                onChange={(val) => setFormData({...formData, type: val})} 
              />

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('amount') || 'المبلغ'} ({currency})</label>
                <input type="number" min="0" step="0.01" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-green-500 outline-none focus:border-green-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">ملاحظات (اختياري)</label>
                <input type="text" placeholder="مثال: رحلة إلى المطار..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-green-500" />
              </div>
            </div>
            <button type="submit" className="w-full mt-5 bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-green-600 active:scale-[0.98] transition-all">
              حفظ الإيراد
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
