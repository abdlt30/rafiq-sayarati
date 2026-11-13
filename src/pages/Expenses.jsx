import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wallet, AlertCircle, CheckCircle } from 'lucide-react';

// ✅ 1. تحديث المسارات إلى الهيكل الجديد (Shared)
import OptionPicker from '../shared/components/ui/OptionPicker';
import ConfirmModal from '../shared/components/ui/ConfirmModal';
import { safeNumber } from '../shared/utils/safeNumber';
import { formatDate } from '../shared/utils/formatters';

const EMPTY_FORM = { date: '', type: 'insurance', cost: '' };

export default function Expenses() {
  const { currentCar, t, currency, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const toastTimeoutRef = useRef(null);
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  /* ✅ 2. إزالة الكود الميت (|| 'fallback') */
  const expenseTypes = useMemo(() => [
    { value: 'insurance', label: t('insurance') },
    { value: 'taxes', label: t('taxes') },
    { value: 'carWash', label: t('carWash') },
    { value: 'fines', label: t('fines') },
    { value: 'parking', label: t('parking') },
    { value: 'other', label: t('other') }
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
      // ✅ إصلاح أمني: استخدام String() لضمان التطابق
      const carExpenses = allExpenses.filter(r => String(r.carId) === String(currentCar.id));
      
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

    const isBlank = (v) => v === '' || v === undefined || v === null;
    if (isBlank(formData.date) || isBlank(formData.type) || isBlank(formData.cost)) {
      return showToast(t('fillRequiredFields'), 'error');
    }

    // ✅ تحقق أمني: منع الأنواع غير المعروفة
    if (!validTypes.has(formData.type)) {
      return showToast(t('errorSaving'), 'error');
    }

    // ✅ 3. تحقق رياضي صارم (مهندس الرياضيات)
    const costNum = Number(formData.cost);
    if (!Number.isFinite(costNum) || costNum < 0) {
      return showToast(t('invalidNumbers'), 'error');
    }

    // ✅ حد أقصى معقول (1 تريليون) لمنع تخزين Infinity
    if (costNum > 1e12) {
      return showToast(t('invalidNumbers'), 'error');
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
      bumpDataVersion();
      closeModal();
      showToast(t('saveSuccess'), 'success');
    } catch (error) {
      console.error("خطأ في حفظ المصروف:", error);
      showToast(t('errorSaving'), 'error');
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
      showToast(t('errorSaving'), 'error');
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

  /* ✅ 4. حساب الإجمالي مع حماية رياضية */
  const total = useMemo(() => {
    return records.reduce((sum, r) => {
      // safeNumber يرفض NaN/Infinity ويعيد 0
      return sum + safeNumber(r.cost);
    }, 0);
  }, [records]);

  /* ✅ رسالة الحذف مع fallback صحيح */
  const deleteMessage = useMemo(() => {
    const msg = t('confirmDeleteMsg');
    return msg === 'confirmDeleteMsg' 
      ? 'هل أنت متأكد من حذف هذا المصروف؟' 
      : msg;
  }, [t]);

  /* ✅ اسم النوع المعروض */
  const getTypeLabel = (type) => {
    const found = expenseTypes.find(e => e.value === type);
    if (found) return found.label;
    return type || '—';
  };

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={dismissToast} 
            aria-label={t('close')}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('expenses')}</h1>
      </div>

      {/* بطاقة الإجمالي */}
      <div className="bg-gradient-to-br from-[var(--primary)]/10 to-transparent border border-[var(--primary)]/20 p-4 rounded-2xl mb-2">
        <span className="text-xs text-[var(--text-muted)] block mb-1">{t('totalCost')}</span>
        <span className="text-2xl font-extrabold text-[var(--text)]">
          {total.toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{currency}</span>
        </span>
      </div>

      {/* القائمة */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Wallet size={48} className="opacity-40" aria-hidden="true" />
          </div>
          <p>{t('noExpenses')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => {
            // ✅ استخدام safeNumber
            const displayCost = safeNumber(record.cost);
            return (
              <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                    <Wallet size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[var(--text)] font-bold text-sm">
                      {displayCost.toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {/* ✅ 5. استخدام formatDate */}
                      {formatDate(record.date, todayLocale)} • {getTypeLabel(record.type)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    type="button"
                    onClick={() => openEdit(record)} 
                    aria-label={t('edit')}
                    className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"
                  >
                    <Edit2 size={14} aria-hidden="true" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeleteId(record.id)} 
                    aria-label={t('confirmDelete')}
                    className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                  >
                    <Trash2 size={14} aria-hidden="true" />
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
        aria-label={t('addExpense')}
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} aria-hidden="true" />
      </button>

      {/* نافذة الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete')}
        message={deleteMessage}
        variant="danger" 
        confirmText={t('confirmDeleteBtn')} 
      />

      {/* نافذة الإضافة/التعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} noValidate className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button 
              type="button" 
              onClick={closeModal} 
              aria-label={t('close')}
              className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white active:scale-90 transition-all z-10"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? t('edit') : t('addExpense')}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date')}</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" 
                />
              </div>
              
              <OptionPicker 
                label={t('expenseType')} 
                options={expenseTypes} 
                value={formData.type} 
                onChange={(val) => setFormData({...formData, type: val})} 
              />

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('amount')} ({currency})</label>
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
              {t('save')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
