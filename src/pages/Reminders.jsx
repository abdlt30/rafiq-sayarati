import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
// تمت إضافة أيقونة Settings2
import { Bell, Plus, X, Trash2, Wrench, Shield, Calendar, Gauge, AlertTriangle, Settings2 } from 'lucide-react';

export default function Reminders() {
  const { currentCar, t } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // حالة لتخزين الأنواع المخصصة
  const [customTypes, setCustomTypes] = useState([]);
  
  // النموذج يدعم التاريخ والعداد في نفس الوقت
  const [formData, setFormData] = useState({ type: 'oilChange', date: '', odometer: '' });

  useEffect(() => {
    if (currentCar) {
      const carReminders = dbService.getReminders().filter(r => r.carId === currentCar.id);
      setRecords(carReminders);
      setCustomTypes(dbService.getCustomTypes()); // جلب الأنواع المخصصة
    }
  }, [currentCar]);

  const handleAddCustomType = () => {
    const newType = window.prompt(t('enterCustomTypeName') || 'أدخل اسم التذكير الجديد:');
    if (newType && newType.trim() !== '') {
      const updatedTypes = dbService.addCustomType(newType.trim());
      setCustomTypes(updatedTypes);
      setFormData({ ...formData, type: newType.trim() }); // اختياره تلقائياً
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.date && !formData.odometer) {
      return alert(t('fillRequiredFields') || 'الرجاء إدخال التاريخ أو العداد على الأقل.');
    }

    const data = { 
      carId: currentCar.id, 
      type: formData.type, 
      date: formData.date || null, 
      odometer: formData.odometer ? Number(formData.odometer) : null 
    };

    const newRecord = dbService.addReminder(data);
    if (newRecord) {
      setRecords([...records, newRecord]);
    }
    
    setIsModalOpen(false);
    setFormData({ type: 'oilChange', date: '', odometer: '' }); 
  };

  const handleDelete = (id) => {
    if (window.confirm(t('confirmDelete') || 'هل أنت متأكد من الحذف؟')) {
      dbService.deleteReminder(id);
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // 🧠 الخوارزمية الذكية: تحسب أيهما أقرب (التاريخ أم المسافة)
  const getSmartStatus = (record) => {
    const now = new Date();
    let daysLeft = null;
    let kmLeft = null;

    if (record.date) {
      daysLeft = Math.ceil((new Date(record.date) - now) / (1000 * 60 * 60 * 24));
    }
    
    if (record.odometer && currentCar?.currentOdometer) {
      kmLeft = Number(record.odometer) - Number(currentCar.currentOdometer);
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

  // تحديث دالة الأيقونات لدعم الأنواع المخصصة
  const getRecordIcon = (type) => {
    if (type === 'oil' || type === 'oilChange') return <Wrench size={20} />;
    if (type === 'insurance') return <Shield size={20} />;
    if (type === 'inspection' || type === 'technicalInspection') return <Calendar size={20} />;
    return <Bell size={20} />; // أيقونة افتراضية لأي نوع مخصص
  };

  return (
    <div className="space-y-4 pb-24 px-4">
      {/* الشريط العلوي المحسن */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reminders') || 'التذكيرات'}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 transition-transform">
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
                      {/* ترجمة النوع إذا كان افتراضياً، أو عرضه كما هو إذا كان مخصصاً */}
                      {t(record.type) !== record.type ? t(record.type) : record.type}
                    </p>
                    <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${status.color}`}>
                      <StatusIcon size={14} />
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
            
            {/* القائمة المنسدلة الجديدة بدلاً من الأزرار الثلاثة */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-[var(--text-muted)] block">{t('reminderType') || 'نوع التذكير'}</label>
                <button type="button" onClick={handleAddCustomType} className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline">
                  <Settings2 size={12} /> {t('addType') || 'إضافة نوع'}
                </button>
              </div>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]"
              >
                <optgroup label={t('defaultTypes') || 'أنواع افتراضية'}>
                  <option value="oilChange">{t('oilChange') || 'تغيير زيت'}</option>
                  <option value="insurance">{t('insurance') || 'تأمين'}</option>
                  <option value="inspection">{t('technicalInspection') || 'فحص تقني'}</option>
                </optgroup>
                {customTypes.length > 0 && (
                  <optgroup label={t('customTypes') || 'أنواع مخصصة'}>
                    {customTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            
            {/* الحقول: التاريخ والعداد معاً */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate') || 'التاريخ (اختياري)'}</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none [color-scheme:dark] focus:border-[var(--primary)]" 
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('odometer') || 'العداد (اختياري)'}</label>
                <input 
                  type="number" 
                  value={formData.odometer} 
                  onChange={e => setFormData({...formData, odometer: e.target.value})} 
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
