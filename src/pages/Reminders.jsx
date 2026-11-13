import { useState, useEffect, useContext, useCallback } from 'react';
// ✅ الامتدادات صحيحة
import { AppContext } from '../context/AppContext.jsx'; 
import { dbService } from '../services/dbService.js'; 
import { Bell, Plus, X, Trash2, Wrench, Shield, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx'; 

export default function Reminders() {
  const { currentCar, t } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ حالة تحميل جديدة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null); 
  
  const [formData, setFormData] = useState({ type: 'oil', date: '', odometer: '' });
  const [errorMsg, setErrorMsg] = useState('');

  /* ===================== Load Data (Async) ===================== */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (currentCar) {
        // ✅ إضافة await لأن dbService أصبح يعتمد على IndexedDB
        const allReminders = await dbService.getReminders();
        const carReminders = (allReminders || []).filter(r => String(r.carId) === String(currentCar.id));
        
        // ترتيب التذكيرات (التاريخ الأقرب أولاً)
        carReminders.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
        setRecords(carReminders);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCar]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  /* ===================== Save (Async) ===================== */
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // مسح الخطأ السابق

    if (!formData.date && !formData.odometer) {
      setErrorMsg(t('fillRequiredFields') || 'الرجاء إدخال التاريخ أو العداد على الأقل.');
      return;
    }

    // التحقق من صحة العداد
    const odoNum = formData.odometer ? Number(formData.odometer) : null;
    if (odoNum !== null && (!Number.isFinite(odoNum) || odoNum < 0)) {
       setErrorMsg(t('invalidNumbers') || 'الرجاء إدخال رقم عداد صحيح.');
       return;
    }

    try {
      const data = { 
        carId: currentCar.id, 
        type: formData.type, 
        date: formData.date || null, 
        odometer: odoNum
      };

      // ✅ إضافة await لدوال قاعدة البيانات
      await dbService.addReminder(data);
      
      await loadData(); // ✅ إعادة جلب البيانات
      
      setIsModalOpen(false);
      setFormData({ type: 'oil', date: '', odometer: '' }); 
    } catch (error) {
      console.error("خطأ في حفظ التذكير:", error);
      setErrorMsg(t('errorSaving') || 'حدث خطأ أثناء الحفظ.');
    }
  };

  /* ===================== Delete (Async) ===================== */
  const handleDelete = async () => {
    if (deleteId) {
      try {
        // ✅ إضافة await
        await dbService.deleteReminder(deleteId);
        await loadData(); 
        setDeleteId(null);
      } catch (error) {
        console.error("Error deleting reminder:", error);
        setDeleteId(null);
      }
    }
  };

  // 🧠 الخوارزمية الذكية
  const getSmartStatus = (record) => {
    const now = new Date();
    let daysLeft = null;
    let kmLeft = null;

    if (record.date) {
      // ✅ حماية رياضية: التأكد من أن التاريخ صالح
      const targetDate = new Date(record.date);
      if (!isNaN(targetDate.getTime())) {
        daysLeft = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      }
    }
    
    if (record.odometer && currentCar?.odometer) {
      kmLeft = Number(record.odometer) - Number(currentCar.odometer);
    }

    if (daysLeft === null && kmLeft === null) {
      return { label: t('active') || 'نشط', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Bell };
    }

    const isOverdue = (daysLeft !== null && daysLeft < 0) || (kmLeft !== null && kmLeft < 0);
    if (isOverdue) {
      return { label: t('overdue') || 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
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
  };

  const getRecordIcon = (type) => {
    if (type === 'oil') return <Wrench size={20} />;
    if (type === 'insurance') return <Shield size={20} />;
    return <Calendar size={20} />;
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
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reminders') || 'التذكيرات'}</h1>
        <button 
          type="button"
          onClick={() => { setIsModalOpen(true); setErrorMsg(''); }} 
          className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* قائمة التذكيرات */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Bell size={48} className="opacity-40" />
          </div>
          <p>{t('noReminders') || 'لا توجد تذكيرات حالياً.'}</p>
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
                      <StatusIcon size={14} />
                      {status.label}
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setDeleteId(record.id)} 
                  className="text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ نافذة تأكيد الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف هذا التذكير؟'}
        variant="danger"
        confirmText={t('confirmDeleteBtn')}
      />

      {/* نافذة الإضافة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[var(--text)]">{t('addReminder') || 'إضافة تذكير'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-2 rounded-lg text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'oil'}))} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'oil' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('oil') || 'زيت'}</button>
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'insurance'}))} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'insurance' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('insurance') || 'تأمين'}</button>
              <button type="button" onClick={() => setFormData(prev => ({...prev, type: 'inspection'}))} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'inspection' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('inspection') || 'فحص'}</button>
            </div>
            
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate') || 'التاريخ (اختياري)'}</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none [color-scheme:dark] focus:border-[var(--primary)]" 
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('odometer') || 'العداد (اختياري)'}</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.odometer} 
                  onChange={e => setFormData(prev => ({...prev, odometer: e.target.value}))} 
                  placeholder="مثال: 95000"
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center">التطبيق سينبهك بأيهما يأتي أولاً.</p>
            </div>
            
            <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl mt-4 shadow-lg hover:bg-blue-600 transition-colors">
              {t('save') || 'حفظ'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
