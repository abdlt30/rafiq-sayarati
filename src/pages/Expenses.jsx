import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Plus, Trash2, Edit2, X, Wallet, AlertCircle, CheckCircle } from 'lucide-react';

import OptionPicker from '../shared/components/ui/OptionPicker.jsx';
import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx';
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { date: '', type: 'insurance', cost: '' };

export default function Expenses() {
  const { currentCar, t, currency, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const toastTimeoutRef = useRef(null);
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const expenseTypes = useMemo(() => [
    { value: 'insurance', label: t('insurance') }, { value: 'taxes', label: t('taxes') },
    { value: 'carWash', label: t('carWash') }, { value: 'fines', label: t('fines') },
    { value: 'parking', label: t('parking') }, { value: 'other', label: t('other') }
  ], [t]);

  const validTypes = useMemo(() => new Set(expenseTypes.map(e => e.value)), [expenseTypes]);

  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!currentCar) return;
      const allExpenses = await dbService.getExpenses();
      const carExpenses = (allExpenses || []).filter(r => String(r.carId) === String(currentCar.id));
      setRecords([...carExpenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    } catch (e) { console.error(e); setRecords([]); } finally { setIsLoading(false); }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  const total = useMemo(() => records.reduce((sum, r) => sum + safeNumber(r.cost), 0), [records]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar || !formData.date || !formData.type || !formData.cost) return showToast(t('fillRequiredFields'), 'error');
    if (!validTypes.has(formData.type)) return showToast(t('errorSaving'), 'error');
    const costNum = Number(formData.cost);
    if (!Number.isFinite(costNum) || costNum < 0 || costNum > 1e12) return showToast(t('invalidNumbers'), 'error');

    const data = { carId: currentCar.id, date: formData.date, type: formData.type, cost: costNum };
    try {
      if (editingId) await dbService.updateExpense(editingId, data);
      else await dbService.addExpense(data);
      await loadData(); bumpDataVersion(); closeModal(); showToast(t('saveSuccess'), 'success');
    } catch (error) { showToast(t('errorSaving'), 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await dbService.deleteExpense(deleteId); await loadData(); bumpDataVersion(); setDeleteId(null); } catch (e) { showToast(t('errorSaving'), 'error'); setDeleteId(null); }
  };

  const openAddModal = () => { setEditingId(null); setFormData({ date: new Date().toISOString().split('T')[0], type: 'insurance', cost: '' }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-[var(--surface-2)] rounded-lg w-1/3 mb-6"></div>
        <div className="h-24 bg-[var(--surface-2)] rounded-2xl"></div>
        <div className="h-20 bg-[var(--surface-2)] rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-2 opacity-70"><X size={16} /></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('expenses')}</h1>
      </div>

      <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 p-4 rounded-2xl mb-2">
        <span className="text-xs text-[var(--text-muted)] block mb-1">{t('totalExpenses')}</span>
        <span className="text-2xl font-extrabold text-purple-500">{total.toLocaleString()} <span className="text-sm font-normal">{currency}</span></span>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-16 p-6 text-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <Wallet size={36} className="text-purple-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">{t('trackExpenses') || 'تتبع كل درهم'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">{t('noExpenses') || 'لا توجد مصاريف مسجلة.'} أضف أول مصروف.</p>
          <button onClick={openAddModal} className="flex items-center gap-2 text-white bg-[var(--primary)] px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 shadow-lg">
            <Plus size={18} /> {t('addExpense')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0"><Wallet size={18} /></div>
                <div>
                  <p className="text-[var(--text)] font-bold text-sm">{safeNumber(record.cost).toLocaleString()} <span className="text-[10px] text-[var(--text-muted)]">{currency}</span></p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{formatDate(record.date, todayLocale)} • {expenseTypes.find(e => e.value === record.type)?.label || record.type}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => { setEditingId(record.id); setFormData({ date: record.date, type: validTypes.has(record.type) ? record.type : 'other', cost: String(record.cost) }); setIsModalOpen(true); }} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg active:scale-90"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg active:scale-90"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ إصلاح: إخفاء الزر العائم عندما تكون القائمة فارغة لمنع التداخل */}
      {records.length > 0 && (
        <button type="button" onClick={openAddModal} className="fixed bottom-24 right-6 rtl:left-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"><Plus size={28} /></button>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={t('confirmDelete')} message={t('confirmDeleteMsg')} variant="danger" confirmText={t('confirmDeleteBtn')} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 rtl:right-4 p-1.5 bg-[var(--surface-2)] rounded-full z-10"><X size={20} /></button>
            <h2 className="text-lg font-bold text-center mb-5 mt-1">{editingId ? t('edit') : t('addExpense')}</h2>
            <div className="space-y-3">
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">{t('date')}</label><input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm [color-scheme:dark]" /></div>
              <OptionPicker label={t('expenseType')} options={expenseTypes} value={formData.type} onChange={(val) => setFormData(prev => ({...prev, type: val}))} />
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">{t('amount')} ({currency})</label><input type="number" step="0.01" value={formData.cost} onChange={e => setFormData(prev => ({...prev, cost: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold" /></div>
            </div>
            <button type="submit" className="w-full mt-5 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95">{t('save')}</button>
          </form>
        </div>
      )}
    </div>
  );
}
