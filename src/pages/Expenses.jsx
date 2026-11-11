import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import OptionPicker from '../components/ui/OptionPicker';
import ConfirmModal from '../components/ui/ConfirmModal';

const EMPTY_FORM = { date: '', type: 'insurance', cost: '' };

export default function Expenses() {
  const { currentCar, t, currency, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const toastTimeoutRef = useRef(null);

  /* ✅ قائمة الأنواع محفوظة memoized */
  const expenseTypes = useMemo(() => [
    { value: 'insurance', label: t('insurance') || 'تأمين' },
    { value: 'taxes', label: t('taxes') || 'ضرائب' },
    { value: 'carWash', label: t('carWash') || 'غسيل' },
    { value: 'fines', label: t('fines') || 'مخالفات مرورية' },
    { value: 'parking', label: t('parking') || 'رسوم مواقف' },
    { value: 'other', label: t('other') || 'أخرى' }
  ], [t]);

  const validTypes = useMemo(
    () => new Set(expenseTypes.map(e => e.value)),
    [expenseTypes]
  );

  /* ===================== Toast ===================== */
  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  /* ===================== Load Data ===================== */
  const loadData = useCallback(() => {
    try {
      if (!currentCar) {
        setRecords([]);
        return;
      }
      const allExpenses = dbService.getExpenses() || [];
      const carExpenses = allExpenses.filter(r => r.carId === currentCar.id);
      // ✅ ترتيب مستقر بـ localeCompare (يعمل مع ISO dates)
      const sorted = [...carExpenses].sort((a, b) =>
        (b.date || '').localeCompare(a.date || '')
      );
      setRecords(sorted);
    } catch (e) {
      console.error('loadData failed:', e);
      setRecords([]);
    }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  /* ===================== Save ===================== */
  const handleSave = (e) => {
    e.preventDefault();
    if (!currentCar) return;

    // ✅ تحقق يدوي شامل
    const isBlank = (v) => v === '' || v === undefined || v === null;
    if (isBlank(formData.date) || isBlank(formData.type) || isBlank(formData.cost)) {
      return showToast(t('fillRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة.', 'error');
    }

    // ✅ تحقق من النوع (منع أنواع غير معروفة)
    if (!validTypes.has(formData.type)) {
      return showToast(t('errorSaving') || 'نوع المصروف غير صالح.', 'error');
    }

    // ✅ تحقق رياضي من التكلفة
    const costNum = Number(formData.cost);
    if (!Number.isFinite(costNum) || costNum < 0) {
      return showToast(t('invalidNumbers') || 'الرجاء إدخال مبلغ صحيح (صفر أو أكثر).', 'error');
    }

    // ✅ حد أقصى معقول (يمنع التخزين الفاسد/الهجمات)
    if (costNum > 1e12) {
      return showToast(t('invalidNumbers') || 'المبلغ كبير جداً.', 'error');
    }

    const data = { 
      carId: currentCar.id, 
      date: formData.date,
      type: formData.type,
      cost: costNum
    };
    
    try {
      if (editingId) {
        dbService.updateExpense(editingId, data);
      } else {
        dbService.addExpense(data);
      }
      loadData();
      bumpDataVersion(); // ✅ يُحدّث Dashboard
      closeModal();
      showToast(t('saveSuccess') || 'تم الحفظ بنجاح!', 'success');
    } catch (error) {
      console.error("خطأ في حفظ المصروف:", error);
      showToast(t('errorSaving') || "حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.", 'error');
    }
  };

  /* ===================== Delete ===================== */
  const handleDelete = () => {
    if (!deleteId) return;
    try {
      dbService.deleteExpense(deleteId);
      loadData();
      bumpDataVersion();
      setDeleteId(null);
    } catch (e) {
      console.error('deleteExpense failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving') || 'حدث خطأ أثناء الحذف.', 'error');
    }
  };

  /* ===================== Modals ===================== */
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      type: 'insurance', 
      cost: '' 
    });
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ 
      date: record.date || '', 
      type: validTypes.has(record.type) ? record.type : 'other', 
      cost: record.cost != null ? String(record.cost) : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  /* ✅ الإجمالي memoized + حماية من NaN */
  const total = useMemo(() => {
    return records.reduce((sum, r) => {
      const v = Number(r.cost);
      return sum + (Number.isFinite(v) ? v : 0);
    }, 0);
  }, [records]);

  /* ✅ رسالة الحذف مع fallback صحيح */
  const deleteMessage = useMemo(() => {
    const msg = t('confirmDeleteMsg');
    return msg === 'confirmDeleteMsg' 
      ? 'هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء.' 
      : msg;
  }, [t]);

  /* ✅ اسم النوع المعروض */
  const getTypeLabel = (type) => {
    const found = expenseTypes.find(e => e.value === type);
    if (found) return found.label;
    // نوع قديم/غير معروف → اعرض النص الخام بدلاً من "undefined"
    return type || '—';
  };

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {/* ✅ الإشعار العائم */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={dismissToast} 
            aria-label="إغلاق"
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

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
          {records.map(record => {
            const safeCost = Number(record.cost);
            const displayCost = Number.isFinite(safeCost) ? safeCost : 0;
            return (
              <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-[var(--text)] font-bold text-sm">
                      {displayCost.toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {record.date} • {getTypeLabel(record.type)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    type="button"
                    onClick={() => openEdit(record)} 
                    aria-label="تعديل"
                    className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeleteId(record.id)} 
                    aria-label="حذف"
                    className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* الزر العائم */}
      <button 
        type="button"
        onClick={openAddModal} 
        aria-label="إضافة مصروف"
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      {/* نافذة الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={deleteMessage}
        variant="danger" 
        confirmText={t('confirmDeleteBtn') || 'نعم، احذف'} 
      />

      {/* نافذة الإضافة/التعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} noValidate className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button 
              type="button" 
              onClick={closeModal} 
              aria-label="إغلاق"
              className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white active:scale-90 transition-all z-10"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? (t('edit') || 'تعديل مصروف') : (t('addExpense') || 'إضافة مصروف')}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" 
                />
              </div>
              
              <OptionPicker 
                label={t('expenseType') || 'نوع المصروف'} 
                options={expenseTypes} 
                value={formData.type} 
                onChange={(val) => setFormData({...formData, type: val})} 
              />

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('amount') || 'المبلغ'} ({currency})</label>
                <input 
                  type="number" 
                  inputMode="decimal" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={formData.cost} 
                  onChange={e => setFormData({...formData, cost: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>
            </div>
            
            <button type="submit" className="w-full mt-5 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all">
              {t('save') || 'حفظ البيانات'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
