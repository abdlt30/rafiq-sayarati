import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Bell, Plus, X, Trash2, Wrench, Shield, Calendar } from 'lucide-react';

export default function Reminders() {
  // 1. إضافة t من الـ Context
  const { currentCar, t } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'oil', date: '', odometer: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getReminders().filter(r => r.carId === currentCar.id));
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { carId: currentCar.id, type: formData.type, date: formData.date || null, odometer: Number(formData.odometer) || null };
    dbService.addReminder(data);
    setRecords(dbService.getReminders().filter(r => r.carId === currentCar.id));
    setIsModalOpen(false);
    setFormData({ type: 'oil', date: '', odometer: '' }); // تصفير النموذج بعد الحفظ
  };

  const getStatus = (record) => {
    if (record.date) {
      const daysLeft = Math.ceil((new Date(record.date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) return { label: t('overdue') || 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10' };
      if (daysLeft <= 7) return { label: t('soon') || 'قريب', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      return { label: `${t('after') || 'بعد'} ${daysLeft} ${t('days') || 'يوم'}`, color: 'text-green-500', bg: 'bg-green-500/10' };
    }
    if (record.odometer) {
      const kmLeft = record.odometer - currentCar.currentOdometer;
      if (kmLeft < 0) return { label: t('overdue') || 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10' };
      if (kmLeft <= 1000) return { label: t('soon') || 'قريب', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      return { label: `${t('after') || 'بعد'} ${kmLeft} ${t('km') || 'كم'}`, color: 'text-green-500', bg: 'bg-green-500/10' };
    }
    return { label: t('active') || 'نشط', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  return (
    <div className="space-y-4 pb-24">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reminders') || 'التذكيرات'}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg transition-transform hover:scale-105">
          <Plus size={24} />
        </button>
      </div>

      {/* حالة عدم وجود تذكيرات */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-10">
          <Bell size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t('noReminders') || 'لا توجد تذكيرات حالياً.'}</p>
        </div>
      ) : (
        records.map(record => {
          const status = getStatus(record);
          return (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex justify-between items-center transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}>
                  {record.type === 'oil' ? <Wrench size={20} /> : record.type === 'insurance' ? <Shield size={20} /> : <Calendar size={20} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--text)]">
                    {record.type === 'oil' ? (t('oilChange') || 'تغيير زيت') : record.type === 'insurance' ? (t('insurance') || 'تأمين') : (t('technicalInspection') || 'فحص تقني')}
                  </p>
                  <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
                </div>
              </div>
              <button 
                onClick={() => { dbService.deleteReminder(record.id); setRecords(records.filter(r => r.id !== record.id)); }} 
                className="text-red-500 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })
      )}

      {/* نافذة الإضافة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[var(--text)]">{t('addReminder') || 'إضافة تذكير'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData({...formData, type: 'oil'})} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'oil' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('oil') || 'زيت'}</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'insurance'})} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'insurance' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('insurance') || 'تأمين'}</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'inspection'})} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${formData.type === 'inspection' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{t('inspection') || 'فحص'}</button>
            </div>
            
            {formData.type === 'oil' ? (
              <input 
                type="number" 
                placeholder={t('odometer') || 'العداد (KM)'} 
                required 
                value={formData.odometer} 
                onChange={e => setFormData({...formData, odometer: e.target.value})} 
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
              />
            ) : (
              <input 
                type="date" 
                required 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none [color-scheme:dark] focus:border-[var(--primary)]" 
              />
            )}
            
            <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl mt-4 hover:opacity-90 transition-opacity">
              {t('save') || 'حفظ'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
