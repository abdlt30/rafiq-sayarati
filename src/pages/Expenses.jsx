import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wallet } from 'lucide-react'; // أعدنا Wallet للاستخدام في الحالة الفارغة

export default function Expenses() {
  const { currentCar, t, currency } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // إصلاح جذري: استخدام مفاتيح الترجمة (Keys) بدلاً من النصوص الثابتة
  const [formData, setFormData] = useState({ date: '', type: 'insurance', cost: '' });

  // دالة مساعدة لترتيب السجلات (الأحدث أولاً)
  const sortRecords = (data) => {
    return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  useEffect(() => {
    if (currentCar) {
      const carExpenses = dbService.getExpenses().filter(r => r.carId === currentCar.id);
      setRecords(sortRecords(carExpenses));
    }
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { carId: currentCar.id, ...formData, cost: Number(formData.cost) };
    
    if (editingId) {
      const updated = dbService.updateExpense(editingId, data);
      setRecords(sortRecords(updated));
    } else {
      const newRecord = dbService.addExpense(data);
      if (newRecord) {
        setRecords(sortRecords([newRecord, ...records]));
      }
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm(t('confirmDelete') || 'هل أنت متأكد من الحذف؟')) {
      const updated = dbService.deleteExpense(id);
      setRecords(sortRecords(updated));
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    // إذا كان السجل القديم محفوظاً بالعربية، نحوله لمفتاح الترجمة
    const typeKeyMap = {
      'تأمين': 'insurance', 'ضرائب': 'taxes', 'غسيل': 'carWash',
      'مخالفات': 'fines', 'مواقف': 'parking', 'أخرى': 'other'
    };
    const typeKey = typeKeyMap[record.type] || record.type;

    setFormData({ date: record.date, type: typeKey, cost: record.cost });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'insurance', cost: '' });
  };

  return (
    <div className="space-y-4 pb-24 px-4">
      
      {/* الشريط العلوي المحسن */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('expenses') || 'المصاريف'}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 transition-transform">
          <Plus size={24} />
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Wallet size={48} className="opacity-40" />
          </div>
          <p>{t('noExpenses') || 'لا توجد مصاريف مسجلة.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3 transition-colors hover:border-purple-500/30">
              <div className="flex justify-between items-start">
                <div>
                  {/* تنسيق الأرقام وإزالة اللون الأبيض الثابت */}
                  <p className="text-[var(--text)] font-extrabold text-lg">
                    {Number(record.cost).toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  <p className="text-[var(--text-muted)] text-xs font-medium mt-0.5">{record.date}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(record)} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg hover:bg-blue-400/20 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg hover:bg-red-400/20 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="bg-[var(--surface-2)] px-3 py-2 rounded-xl text-[var(--primary)] text-xs font-bold w-fit flex items-center gap-1.5">
                {/* الترجمة الذكية للنوع (تدعم السجلات القديمة والجديدة) */}
                {t(record.type) !== record.type ? t(record.type) : record.type}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة الإضافة/التعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] overflow-y-auto">
            
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-center mb-6 text-[var(--text)] mt-2">
              {editingId ? (t('edit') || 'تعديل') : (t('addExpense') || 'إضافة مصروف')}
            </h2>
            
            <div className="space-y-4">
              {/* التاريخ */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" 
                />
              </div>

              {/* النوع (يستخدم مفاتيح الترجمة الآن) */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('expenseType') || 'نوع المصروف'}</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="insurance">{t('insurance') || 'تأمين'}</option>
                  <option value="taxes">{t('taxes') || 'ضرائب'}</option>
                  <option value="carWash">{t('carWash') || 'غسيل'}</option>
                  <option value="fines">{t('fines') || 'مخالفات مرورية'}</option>
                  <option value="parking">{t('parking') || 'رسوم مواقف'}</option>
                  <option value="other">{t('other') || 'أخرى'}</option>
                </select>
              </div>

              {/* المبلغ */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('amount') || 'المبلغ'} ({currency})</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  placeholder={t('enterAmount') || 'أدخل المبلغ'} 
                  value={formData.cost} 
                  onChange={e => setFormData({...formData, cost: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>
            </div>

            <button type="submit" className="w-full mt-8 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition-colors">
              {t('save') || 'حفظ'}
            </button>

          </form>
        </div>
      )}
    </div>
  );
}
