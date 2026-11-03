import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Bell, Plus, X, Trash2, Edit2, Shield, Wrench, Calendar, AlertTriangle } from 'lucide-react';

export default function Reminders() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    type: 'oil', // النوع الافتراضي
    date: '', 
    odometer: '' 
  });

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getReminders().filter(r => r.carId === currentCar.id));
    }
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      carId: currentCar.id,
      type: formData.type,
      date: formData.date || null,
      odometer: Number(formData.odometer) || null,
    };

    if (editingId) {
      setRecords(dbService.updateReminder(editingId, data));
    } else {
      setRecords([dbService.addReminder(data), ...records]);
    }
    closeModal();
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ type: record.type, date: record.date || '', odometer: record.odometer || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ type: 'oil', date: '', odometer: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التذكير؟")) {
      setRecords(dbService.deleteReminder(id));
    }
  };

  // حساب حالة التذكير (مبسط)
  const getStatus = (record) => {
    if (record.date) {
      const daysLeft = Math.ceil((new Date(record.date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) return { label: 'متأخر', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
      if (daysLeft <= 7) return { label: 'قريب', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
      return { label: `بعد ${daysLeft} يوم`, color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    }
    if (record.odometer) {
      const kmLeft = record.odometer - currentCar.currentOdometer;
      if (kmLeft < 0) return { label: 'متأخر', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
      if (kmLeft <= 1000) return { label: 'قريب', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
      return { label: `بعد ${kmLeft} كم`, color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    }
    return { label: 'نشط', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
  };

  // أيقونات التذكيرات
  const getIcon = (type) => {
    switch(type) {
      case 'oil': return <Wrench size={20} />;
      case 'insurance': return <Shield size={20} />;
      case 'inspection': return <Calendar size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">التذكيرات</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/30">
          <Plus size={24} />
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-20">
          <Bell size={48} className="mx-auto text-slate-600 mb-4" />
          <p>لا توجد تذكيرات حالياً.</p>
        </div>
      ) : (
        records.map(record => {
          const status = getStatus(record);
          return (
            <div key={record.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${status.color}`}>
                    {getIcon(record.type)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">
                      {record.type === 'oil' ? 'تغيير زيت' : 
                       record.type === 'insurance' ? 'تأمين' : 
                       record.type === 'inspection' ? 'فحص تقني' : 'تذكير آخر'}
                    </h3>
                    <div className={`text-xs mt-1 px-2 py-0.5 rounded-md border ${status.color}`}>
                      {status.label}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(record)} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* النافذة المنبثقة (البسيطة) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-3xl w-full max-w-sm border border-dark-700 p-6 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 text-center">{editingId ? 'تعديل التذكير' : 'إضافة تذكير جديد'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              {/* اختيار نوع التذكير (أزرار كبيرة) */}
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setFormData({...formData, type: 'oil'})} className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${formData.type === 'oil' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-dark-700 text-slate-400'}`}>
                  <Wrench size={20} />
                  <span className="text-xs">زيت</span>
                </button>
                <button type="button" onClick={() => setFormData({...formData, type: 'insurance'})} className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${formData.type === 'insurance' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-dark-700 text-slate-400'}`}>
                  <Shield size={20} />
                  <span className="text-xs">تأمين</span>
                </button>
                <button type="button" onClick={() => setFormData({...formData, type: 'inspection'})} className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${formData.type === 'inspection' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-dark-700 text-slate-400'}`}>
                  <Calendar size={20} />
                  <span className="text-xs">فحص</span>
                </button>
              </div>

              {/* الحقول الديناميكية: إظهار التاريخ إذا كان تأمين/فحص، والعداد إذا كان زيت */}
              {(formData.type === 'insurance' || formData.type === 'inspection') && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">تاريخ الانتهاء</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
                </div>
              )}

              {formData.type === 'oil' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">العداد المستهدف (KM)</label>
                  <input type="number" required value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} placeholder="مثال: 95000" className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 transition">
                {editingId ? 'حفظ التعديلات' : 'حفظ التذكير'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
