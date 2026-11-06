import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Bell, Plus, X, Trash2, Wrench, Shield, Calendar, Gauge } from 'lucide-react';

export default function Reminders() {
  const { currentCar, t } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // المفاتيح (Keys) يجب أن تتطابق مع الترجمات
  const [formData, setFormData] = useState({ type: 'oil', date: '', odometer: '' });

  // دالة ترتيب السجلات (الأحدث أولاً)
  const sortRecords = (data) => {
    return [...data].sort((a, b) => {
      // ترتيب حسب التاريخ إذا وجد، وإلا حسب العداد
      if (a.date && b.date) return new Date(a.date) - new Date(b.date);
      if (a.odometer && b.odometer) return a.odometer - b.odometer;
      return 0;
    });
  };

  useEffect(() => {
    if (currentCar) {
      const carReminders = dbService.getReminders().filter(r => r.carId === currentCar.id);
      setRecords(sortRecords(carReminders));
    }
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { 
      carId: currentCar.id, 
      type: formData.type, 
      date: formData.date || null, 
      odometer: formData.odometer ? Number(formData.odometer) : null 
    };

    const newRecord = dbService.addReminder(data);
    if (newRecord) {
      const updatedRecords = dbService.getReminders().filter(r => r.carId === currentCar.id);
      setRecords(sortRecords(updatedRecords));
    }
    
    setIsModalOpen(false);
    setFormData({ type: 'oil', date: '', odometer: '' }); 
  };

  const handleDelete = (id) => {
    if (window.confirm(t('confirmDelete') || 'هل أنت متأكد من الحذف؟')) {
      dbService.deleteReminder(id);
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const getStatus = (record) => {
    // 1. حساب الحالة بناءً على التاريخ
    if (record.date) {
      const daysLeft = Math.ceil((new Date(record.date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) return { label: t('overdue') || 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10', icon: Bell };
      if (daysLeft <= 7) return { label: `${t('soon') || 'قريب'} (${daysLeft} ${t('days') || 'يوم'})`, color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Bell };
      return { label: `${t('after') || 'بعد'} ${daysLeft} ${t('days') || 'يوم'}`, color: 'text-green-500', bg: 'bg-green-500/10', icon: Calendar };
    }
    
    // 2. حساب الحالة بناءً على العداد (مع حماية من الأخطاء)
    if (record.odometer) {
      const currentOdo = Number(currentCar?.currentOdometer) || 0;
      const kmLeft = Number(record.odometer) - currentOdo;
      
      if (kmLeft < 0) return { label: t('overdue') || 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10', icon: Gauge };
      if (kmLeft <= 1000) return { label: `${t('soon') || 'قريب'} (${kmLeft} ${t('km') || 'كم'})`, color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Gauge };
      return { label: `${t('after') || 'بعد'} ${kmLeft} ${t('km') || 'كم'}`, color: 'text-green-500', bg: 'bg-green-500/10', icon: Gauge };
    }
    
    return { label: t('active') || 'نشط', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Bell };
  };

  const getRecordIcon = (type) => {
    if (type === 'oil') return <Wrench size={20} />;
    if (type === 'insurance') return <Shield size={20} />;
    return <Calendar size={20} />;
  };

  return (
    <div className="space-y-4 pb-24 px-4">
      {/* الشريط العلوي المحسن (Sticky) */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reminders') || 'التذكيرات'}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 transition-transform">
          <Plus size={24} />
        </button>
      </div>

      {/* حالة عدم وجود تذكيرات */}
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
            const status = getStatus(record);
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
                    <div className={`flex items-center gap-1 text-xs font-bold mt-0.5 ${status.color}`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(record.id)} 
                  className="text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

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
            
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData({...formData, type: 'oil'})} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'oil' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('oil') || 'زيت'}</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'insurance'})} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'insurance' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('insurance') || 'تأمين'}</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'inspection'})} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'inspection' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('inspection') || 'فحص'}</button>
            </div>
            
            {/* حقل العداد أو التاريخ بناءً على النوع */}
            {formData.type === 'oil' ? (
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('odometer') || 'العداد (KM)'}</label>
                <input 
                  type="number" 
                  required 
                  value={formData.odometer} 
                  onChange={e => setFormData({...formData, odometer: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>
            ) : (
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate') || 'تاريخ الانتهاء'}</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none [color-scheme:dark] focus:border-[var(--primary)]" 
                />
              </div>
            )}
            
            <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl mt-6 shadow-lg hover:bg-blue-600 transition-colors">
              {t('save') || 'حفظ'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
