import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
// ✅ إضافة الامتدادات المطلوبة لمنع فشل Vite Build
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Plus, Trash2, Edit2, X, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

import OptionPicker from '../shared/components/ui/OptionPicker.jsx';
import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx';
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { date: '', type: 'ride', amount: '', notes: '' };
const MAX_NOTES_LENGTH = 200;
const MAX_AMOUNT = 1e12;

export default function Income() {
  const { currentCar, t, currency, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ حالة تحميل جديدة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const toastTimeoutRef = useRef(null);
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const incomeTypes = useMemo(() => [
    { value: 'ride', label: t('rideIncome') },
    { value: 'rental', label: t('rentalIncome') },
    { value: 'delivery', label: t('deliveryIncome') },
    { value: 'other', label: t('otherIncome') }
  ], [t]);

  const validTypes = useMemo(() => new Set(incomeTypes.map(i => i.value)), [incomeTypes]);

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

  /* ===================== Load Data (Async) ===================== */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!currentCar) {
        setRecords([]);
        return;
      }
      // ✅ إضافة await لجلب البيانات من IndexedDB
      const allIncomes = await dbService.getIncomes();
      const carIncomes = (allIncomes || []).filter(r => String(r.carId) === String(currentCar.id));
      
      const sorted = [...carIncomes].sort((a, b) =>
        (b.date || '').localeCompare(a.date || '')
      );
      setRecords(sorted);
    } catch (e) {
      console.error('loadData failed:', e);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  /* ===================== Save (Async) ===================== */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar) return;

    const isBlank = (v) => v === '' || v === undefined || v === null;

    if (isBlank(formData.date) || isBlank(formData.type) || isBlank(formData.amount)) {
      return showToast(t('fillRequiredFields'), 'error');
    }

    if (!validTypes.has(formData.type)) {
      return showToast(t('invalidIncomeType'), 'error');
    }

    const amountNum = Number(formData.amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      return showToast(t('invalidNumbers'), 'error');
    }

    if (amountNum > MAX_AMOUNT) {
      return showToast(t('invalidNumbers'), 'error');
    }

    const notesValue = (formData.notes || '').trim().slice(0, MAX_NOTES_LENGTH);

    const data = { 
      carId: currentCar.id, 
      date: formData.date,
      type: formData.type,
      amount: amountNum,
      notes: notesValue
    };
    
    try {
      // ✅ إضافة await لدوال قاعدة البيانات
      if (editingId) {
        await dbService.updateIncome(editingId, data);
      } else {
        await dbService.addIncome(data);
      }
      await loadData();
      bumpDataVersion();
      closeModal();
      showToast(t('saveSuccess'), 'success');
    } catch (error) {
      console.error("خطأ في حفظ الإيراد:", error);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== Delete (Async) ===================== */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dbService.deleteIncome(deleteId); // ✅ إضافة await
      await loadData();
      bumpDataVersion();
      setDeleteId(null);
    } catch (e) {
      console.error('deleteIncome failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== Modals ===================== */
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

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ 
      date: record.date || '', 
      type: validTypes.has(record.type) ? record.type : 'other',
      amount: record.amount != null ? String(record.amount) : '',
      notes: record.notes || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  /* ===================== Computed ===================== */
  const total = useMemo(() => {
    return records.reduce((sum, r) => sum + safeNumber(r.amount), 0);
  }, [records]);

  const deleteMessage = useMemo(() => {
    const msg = t('confirmDeleteMsg');
    return msg === 'confirmDeleteMsg' 
      ? 'هل أنت متأكد من حذف هذا الإيراد؟' 
      : msg;
  }, [t]);

  const getTypeLabel = (type) => {
    const found = incomeTypes.find(e => e.value === type);
    if (found) return found.label;
    return type || '—';
  };

  // ✅ شاشة التحميل
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[var(--primary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
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

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('income')}</h1>
      </div>

      <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-4 rounded-2xl mb-2">
        <span className="text-xs text-[var(--text-muted)] block mb-1">{t('totalIncome')}</span>
        <span className="text-2xl font-extrabold text-green-500">
          {total.toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{currency}</span>
        </span>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <TrendingUp size={48} className="opacity-40" aria-hidden="true" />
          </div>
          <p>{t('noIncome')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => {
            const displayAmount = safeNumber(record.amount);
            return (
              <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-green-500 font-bold text-sm">
                      + {displayAmount.toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {formatDate(record.date, todayLocale)} • {getTypeLabel(record.type)}
                      {record.notes ? ` • ${record.notes}` : ''}
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

      <button 
        type="button"
        onClick={openAddModal} 
        aria-label={t('addIncome')}
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} aria-hidden="true" />
      </button>

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete')}
        message={deleteMessage}
        variant="danger" 
        confirmText={t('confirmDeleteBtn')} 
      />

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
              {editingId ? t('editIncome') : t('addIncome')}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date')}</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-green-500" 
                />
              </div>
              
              <OptionPicker 
                label={t('incomeType')} 
                options={incomeTypes} 
                value={formData.type} 
                onChange={(val) => setFormData(prev => ({...prev, type: val}))} 
              />

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('amount')} ({currency})</label>
                <input 
                  type="number" 
                  inputMode="decimal" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={formData.amount} 
                  onChange={e => setFormData(prev => ({...prev, amount: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-green-500 outline-none focus:border-green-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">
                  {t('notes')} ({t('optional')})
                </label>
                <input 
                  type="text" 
                  maxLength={MAX_NOTES_LENGTH}
                  placeholder={t('incomeNotesPlaceholder')} 
                  value={formData.notes} 
                  onChange={e => setFormData(prev => ({...prev, notes: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-green-500" 
                />
                {formData.notes && (
                  <p className="text-[9px] text-[var(--text-muted)] mt-1 text-end">
                    {formData.notes.length}/{MAX_NOTES_LENGTH}
                  </p>
                )}
              </div>
            </div>
            <button type="submit" className="w-full mt-5 bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-green-600 active:scale-[0.98] transition-all">
              {t('saveIncome')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
