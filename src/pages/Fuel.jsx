import { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal'; 

export default function Fuel() {
  const { currentCar, t, currency } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState({ date: '', odometer: '', liters: '', cost: '' });

  useEffect(() => {
    if (currentCar) {
      // ✅ تحسين: استخدام Optional Chaining لتجنب الأخطاء إذا كانت الدالة ترجع null
      const allFuel = dbService.getFuel()?.filter(r => r.carId === currentCar.id) || [];
      setRecords(allFuel.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setRecords([]); // تصفير السجلات إذا لم تكن هناك سيارة محددة
    }
  }, [currentCar]);

  // ✅ حساب الاستهلاك L/100km
  const recordsWithConsumption = useMemo(() => {
    if (records.length === 0) return [];
    const sortedByOdometer = [...records].sort((a, b) => Number(a.odometer) - Number(b.odometer));
    
    const calculated = sortedByOdometer.map((record, index) => {
      let consumption = null;
      if (index > 0) {
        const prevRecord = sortedByOdometer[index - 1];
        const distance = Number(record.odometer) - Number(prevRecord.odometer);
        if (distance > 0 && Number(record.liters) > 0) {
          consumption = ((Number(record.liters) / distance) * 100).toFixed(1);
        }
      }
      return { ...record, consumption };
    });
    return calculated.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentCar) return; // ✅ حماية إضافية
    
    const data = { 
      carId: currentCar.id, 
      ...formData, 
      odometer: Number(formData.odometer), 
      liters: Number(formData.liters), 
      cost: Number(formData.cost) 
    };
    
    if (editingId) {
      const updated = dbService.updateFuel(editingId, data);
      setRecords(updated.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      const newRecord = dbService.addFuel(data);
      if (newRecord) setRecords([newRecord, ...records].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    closeModal();
  };

  const handleDelete = () => {
    if(deleteId) {
      const updated = dbService.deleteFuel(deleteId);
      setRecords(updated.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setDeleteId(null); // إغلاق النافذة وتصفير الحالة
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, odometer: record.odometer, liters: record.liters, cost: record.cost });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', odometer: '', liters: '', cost: '' });
  };

  // ... (باقي كود الـ JSX كما هو، لا يوجد به أخطاء)
  
  return (
    // ... كود الواجهة الخاص بك (نفسه تماماً، ممتاز)
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('fuel') || 'سجل الوقود'}</h1>
      </div>

      {/* قائمة السجلات */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <FuelIcon size={48} className="opacity-40" />
          </div>
          <p>{t('noFuelRecords') || 'لا توجد سجلات وقود.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recordsWithConsumption.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl flex items-center justify-between shadow-sm hover:border-blue-500/30 transition-colors">
              {/* البيانات الأساسية */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <FuelIcon size={18} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm">
                    {Number(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{record.date} • {record.liters} L</p>
                </div>
              </div>

              {/* العداد والاستهلاك والأزرار */}
              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center justify-end gap-1">
                    <Gauge size={10} /> {Number(record.odometer).toLocaleString()} KM
                  </p>
                  {record.consumption ? (
                    <p className="text-[10px] font-bold text-green-500 mt-1 flex items-center justify-end gap-1">
                      <Activity size={10} /> {record.consumption} L/100km
                    </p>
                  ) : (
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{t('firstFill') || 'أول تعبئة'}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openEdit(record)} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-md hover:bg-blue-500/20"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-md hover:bg-red-500/20"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* الزر العائم (FAB) */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      {/* نافذة الحذف الاحترافية */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف سجل الوقود هذا؟ لا يمكن التراجع عن هذا الإجراء.'}
      />

      {/* نافذة الإضافة/التعديل (كما هي في كودك) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           {/* ... محتوى النموذج الخاص بك ... */}
        </div>
      )}
    </div>
  );
}
