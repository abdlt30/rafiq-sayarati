import { useState, useEffect, useContext, useCallback } from 'react';
// ✅ إضافة الامتدادات المطلوبة لمنع فشل Vite Build
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Bell, Plus, X, Trash2, Wrench, Shield, Calendar, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx';
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { type: 'oil', date: '', odometer: '' };

export default function Reminders() {
  const { currentCar, t, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ حالة تحميل جديدة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  /* ===================== Toast ===================== */
  const showToast = useCallback((message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
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
      const allReminders = await dbService.getReminders();
      const carReminders = (allReminders || []).filter(r => String(r.carId) === String(currentCar.id));
      // ✅ ترتيب مستقر
      setRecords([...carReminders].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
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
    
    if (isBlank(formData.date) && isBlank(formData.odometer)) {
      return showToast(t('fillRequiredFields') || 'الرجاء إدخال التاريخ أو العداد على الأقل.', 'error');
    }

    let odoNum = null;
    if (!isBlank(formData.odometer)) {
      const n = Number(formData.odometer);
      if (!Number.isFinite(n) || n < 0) {
        return showToast(t('invalidNumbers') || 'الرجاء إدخال عداد صحيح.', 'error');
      }
      odoNum = Math.round(n);
    }

    try {
      const data = { 
        carId: currentCar.id, 
        type: formData.type, 
        date: formData.date || null, 
        odometer: odoNum 
      };

      // ✅ إضافة await
      await dbService.addReminder(data);
      await loadData(); 
      bumpDataVersion(); 
      
      setIsModalOpen(false);
      setFormData(EMPTY_FORM); 
      showToast(t('saveSuccess') || 'تم حفظ التذكير!', 'success');
    } catch (error) {
      console.error("خطأ في حفظ التذكير:", error);
      showToast(t('errorSaving') || 'حدث خطأ أثناء الحفظ.', 'error');
    }
  };

  /* ===================== Delete (Async) ===================== */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // ✅ إضافة await
      await dbService.deleteReminder(deleteId);
      await loadData();
      bumpDataVersion(); 
      setDeleteId(null);
    } catch (e) {
      console.error('deleteReminder failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving') || 'حدث خطأ أثناء الحذف.', 'error');
    }
  };

  /* ===================== 🧠 الخوارزمية الذكية (مُصححة رياضياً) ===================== */
  const getSmartStatus = useCallback((record) => {
    const carOdo = safeNumber(currentCar?.odometer);
    const reminderOdo = safeNumber(record.odometer);
    
    let daysLeft = null;
    if (record.date) {
      const dateStr = String(record.date).includes('T') ? record.date : `${record.date}T00:00:00`;
      const target = new Date(dateStr);
      if (!isNaN(target.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        daysLeft = Math.round((target - today) / (1000 * 60 * 60 * 24));
      }
    }
    
    let kmLeft = record.odometer ? reminderOdo - carOdo : null;

    if (daysLeft === null && kmLeft === null) {
      return { label: t('active') || 'نشط', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Bell };
    }

    const isOverdue = (daysLeft !== null && daysLeft < 0) || (kmLeft !== null && kmLeft < 0);
    if (isOverdue) {
      return { label: t('overdue') || 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
    }

    if (daysLeft === 0 || kmLeft === 0) {
      return { label: t('dueToday') || 'مستحق اليوم', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
    }

    let message = '';
    let isSoon = false;

    if (daysLeft !== null && kmLeft !== null) {
      if (daysLeft <= 7 || kmLeft <= 500) isSoon = true;
      message = `${t('after') || 'بعد'} ${daysLeft} ${t('days') || 'يوم'} / ${kmLeft} ${t('km') || 'كم'}`;
    } else if (daysLeft !== null) {
      if (daysLeft <= 7) isSoon = true;
      message = `${t('after') || 'بعد'} ${daysLeft} ${t('days') || 'يوم'}`;
    } else if (kmLeft !== null) {
      if (kmLeft <= 500) isSoon = true;
      message = `${t('after') || 'بعد'} ${kmLeft} ${t('km') || 'كم'}`;
    }

    return {
      label: message,
      color: isSoon ? 'text-yellow-500' : 'text-green-500',
      bg: isSoon ? 'bg-yellow-500/10' : 'bg-green-500/10',
      icon: isSoon ? AlertTriangle : Shield
    };
  }, [currentCar?.odometer, t]);

  const getRecordIcon = (type) => {
    if (type === 'oil') return <Wrench size={20} aria-hidden="true" />;
    if (type === 'insurance') return <Shield size={20} aria-hidden="true" />;
    return <Calendar size={20} aria-hidden="true" />;
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
    <div className="space-y-4 pb-24 px-4">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast({ show: false, message: '', type: 'success' })} 
            aria-label={t('close')}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reminders')}</h1>
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)} 
          aria-label={t('addReminder')}
          className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={24} aria-hidden="true" />
        </button>
      </div>

      {/* قائمة التذكيرات */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Bell size={48} className="opacity-40" aria-hidden="true" />
          </div>
          <p>{t('noReminders')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => {
            const status = getSmartStatus(record);
            const StatusIcon = status.icon;
            
            return (
              <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex justify-between items-center transition-colors hover:border-[var(--primary)]/30">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}>
                    {getRecordIcon(record.type)}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-lg">
                      {t(record.type) || record.type}
                    </p>
                    <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${status.color}`}>
                      <StatusIcon size={14} aria-hidden="true" />
                      {status.label}
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setDeleteId(record.id)} 
                  aria-label={t('confirmDelete')}
                  className="text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete')}
        message={t('confirmDeleteMsg')}
        variant="danger"
        confirmText={t('confirmDeleteBtn')}
      />

      {/* نافذة الإضافة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <form onSubmit={handleSave} noValidate className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[var(--text)]">{t('addReminder')}</h2>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                aria-label={t('close')}
                className="p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-red-500 active:scale-90 transition-all"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'oil'}))} aria-pressed={formData.type === 'oil'} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'oil' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('oil')}</button>
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'insurance'}))} aria-pressed={formData.type === 'insurance'} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'insurance' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('insurance')}</button>
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'inspection'}))} aria-pressed={formData.type === 'inspection'} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'inspection' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('inspection')}</button>
            </div>
            
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate')} ({t('optional')})</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none [color-scheme:dark] focus:border-[var(--primary)]" 
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('odometer')} ({t('optional')})</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  min="0"
                  value={formData.odometer} 
                  onChange={e => setFormData(prev => ({...prev, odometer: e.target.value}))} 
                  placeholder="95000"
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center">{t('reminderHint') || 'التطبيق سينبهك بأيهما يأتي أولاً.'}</p>
            </div>
            
            <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl mt-4 shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all">
              {t('save')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
