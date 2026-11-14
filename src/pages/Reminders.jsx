import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Bell, Plus, X, Trash2, Wrench, Shield, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx';
import { safeNumber } from '../shared/utils/safeNumber.js';

const EMPTY_FORM = { type: 'oil', date: '', odometer: '' };

export default function Reminders() {
  const { currentCar, t, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const showToast = useCallback((message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!currentCar) return;
      const allReminders = await dbService.getReminders();
      const carReminders = (allReminders || []).filter(r => String(r.carId) === String(currentCar.id));
      setRecords([...carReminders].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    } catch (e) { console.error(e); setRecords([]); } finally { setIsLoading(false); }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar) return;
    if (!formData.date && !formData.odometer) return showToast(t('fillRequiredFields'), 'error');
    let odoNum = null;
    if (formData.odometer) { const n = Number(formData.odometer); if (!Number.isFinite(n) || n < 0) return showToast(t('invalidNumbers'), 'error'); odoNum = Math.round(n); }
    try {
      await dbService.addReminder({ carId: currentCar.id, type: formData.type, date: formData.date || null, odometer: odoNum });
      await loadData(); bumpDataVersion(); setIsModalOpen(false); setFormData(EMPTY_FORM); showToast(t('saveSuccess'), 'success');
    } catch (error) { showToast(t('errorSaving'), 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await dbService.deleteReminder(deleteId); await loadData(); bumpDataVersion(); setDeleteId(null); } catch (e) { showToast(t('errorSaving'), 'error'); setDeleteId(null); }
  };

  const getSmartStatus = useCallback((record) => {
    const carOdo = safeNumber(currentCar?.odometer);
    const reminderOdo = safeNumber(record.odometer);
    let daysLeft = null;
    if (record.date) {
      const target = new Date(record.date.includes('T') ? record.date : `${record.date}T00:00:00`);
      if (!isNaN(target.getTime())) {
        const today = new Date(); today.setHours(0,0,0,0); target.setHours(0,0,0,0);
        daysLeft = Math.round((target - today) / (1000 * 60 * 60 * 24));
      }
    }
    let kmLeft = record.odometer ? reminderOdo - carOdo : null;
    if (daysLeft === null && kmLeft === null) return { label: t('active'), color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Bell };
    const isOverdue = (daysLeft !== null && daysLeft < 0) || (kmLeft !== null && kmLeft < 0);
    if (isOverdue) return { label: t('overdue'), color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
    if (daysLeft === 0 || kmLeft === 0) return { label: t('dueToday'), color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
    let msg = ''; let isSoon = false;
    if (daysLeft !== null && kmLeft !== null) { if (daysLeft <= 7 || kmLeft <= 500) isSoon = true; msg = `${t('after')} ${daysLeft} ${t('days')} / ${kmLeft} ${t('km')}`; }
    else if (daysLeft !== null) { if (daysLeft <= 7) isSoon = true; msg = `${t('after')} ${daysLeft} ${t('days')}`; }
    else if (kmLeft !== null) { if (kmLeft <= 500) isSoon = true; msg = `${t('after')} ${kmLeft} ${t('km')}`; }
    return { label: msg, color: isSoon ? 'text-yellow-500' : 'text-green-500', bg: isSoon ? 'bg-yellow-500/10' : 'bg-green-500/10', icon: isSoon ? AlertTriangle : Shield };
  }, [currentCar?.odometer, t]);

  const getRecordIcon = (type) => { if (type === 'oil') return <Wrench size={20} />; if (type === 'insurance') return <Shield size={20} />; return <Calendar size={20} />; };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-[var(--surface-2)] rounded-lg w-1/3 mb-6"></div>
        <div className="h-20 bg-[var(--surface-2)] rounded-2xl"></div>
        <div className="h-20 bg-[var(--surface-2)] rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4">
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-2 opacity-70"><X size={16} /></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reminders')}</h1>
        <button type="button" onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"><Plus size={24} /></button>
      </div>

      {records.length === 0 ? (
        // ✅ حالة الفراغ
        <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <Shield size={36} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">{t('allSafe') || 'سيارتك في أمان'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">{t('noReminders')} أضف تذكيراً للصيانة أو الوثائق.</p>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-white bg-[var(--primary)] px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 shadow-lg">
            <Plus size={18} /> {t('addReminder')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => {
            const status = getSmartStatus(record);
            const StatusIcon = status.icon;
            return (
              <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex justify-between items-center transition-colors hover:border-[var(--primary)]/30 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}>{getRecordIcon(record.type)}</div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-sm">{t(record.type) || record.type}</p>
                    <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${status.color}`}><StatusIcon size={14} /> {status.label}</div>
                  </div>
                </div>
                <button onClick={() => setDeleteId(record.id)} className="text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={t('confirmDelete')} message={t('confirmDeleteMsg')} variant="danger" confirmText={t('confirmDeleteBtn')} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold text-[var(--text)]">{t('addReminder')}</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full"><X size={20} /></button></div>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'oil'}))} className={`p-3 rounded-xl border text-sm font-bold ${formData.type === 'oil' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('oil')}</button>
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'insurance'}))} className={`p-3 rounded-xl border text-sm font-bold ${formData.type === 'insurance' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('insurance')}</button>
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'inspection'}))} className={`p-3 rounded-xl border text-sm font-bold ${formData.type === 'inspection' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('inspection')}</button>
            </div>
            <div className="space-y-3 pt-2">
              <div><label className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate')}</label><input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark]" /></div>
              <div><label className="text-xs text-[var(--text-muted)] mb-1 block">{t('odometer')}</label><input type="number" value={formData.odometer} onChange={e => setFormData(prev => ({...prev, odometer: e.target.value}))} placeholder="95000" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]" /></div>
            </div>
            <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl mt-4 shadow-lg active:scale-95">{t('save')}</button>
          </form>
        </div>
      )}
    </div>
  );
}
