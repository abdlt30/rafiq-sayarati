import { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal'; 

export default function Fuel() {
  // ✅ إصلاح 1: استدعاء updateCar من الـ Context لتحديث العداد الرئيسي
  const { currentCar, updateCar, t, currency } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  
  const [formData, setFormData] = useState({ date: '', odometer: '', liters: '', cost: '' });

  const loadData = () => {
    if (currentCar) {
      const allFuel = dbService.getFuel()?.filter(r => r.carId === currentCar.id) || [];
      setRecords(allFuel.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setRecords([]); 
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCar]);

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
    if (!currentCar) return; 
    
    const data = { 
      carId: currentCar.id, 
      date: formData.date,
      odometer: Number(formData.odometer), 
      liters: Number(formData.liters), 
      cost: Number(formData.cost) 
    };
    
    try {
      if (editingId) {
        dbService.updateFuel(editingId, data);
      } else {
        dbService.addFuel(data);
      }

      // ✅ إصلاح 2 (السحر هنا): تحديث عداد السيارة الرئيسي إذا كان هذا العداد أكبر
      if (data.odometer > (currentCar.odometer || 0)) {
        updateCar(currentCar.id, { odometer: data.odometer });
      }

      loadData(); 
      closeModal();
    } catch (error) {
      console.error("خطأ أثناء حفظ البيانات:", error);
      alert("حدث خطأ أثناء الحفظ. تأكد من المدخلات.");
    }
  };

  const handleDelete = () => {
    if(deleteId) {
      dbService.deleteFuel(deleteId);
      loadData();
      setDeleteId(null); 
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, odometer: record.odometer, liters: record.liters, cost: record.cost });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      odometer: currentCar?.odometer || '', // تعبئة العداد الحالي تلقائياً
      liters: '', 
      cost: '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', odometer: '', liters: '', cost: '' });
  };

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('fuel') || 'سجل الوقود'}</h1>
      </div>

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
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-blue-500/30 transition-colors">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <FuelIcon size={18} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm">
                    {Number(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{record.date} • {record.liters} L</p>
                </div>
              </div>

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
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">أول تعبئة</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openEdit(record)} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <button 
        onClick={openAddModal} 
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف سجل الوقود هذا؟ لا يمكن التراجع عن هذا الإجراء.'}
        variant="danger"
        confirmText="نعم، احذف"
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors z-10">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? 'تعديل التعبئة' : 'إضافة تعبئة'}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">التاريخ</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">العداد (KM)</label>
                <input type="number" min="0" required placeholder="0" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">اللترات</label>
                <input type="number" min="0" step="0.01" required placeholder="0.00" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">التكلفة ({currency})</label>
                <input type="number" min="0" step="0.01" required placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
            
            <button type="submit" className="w-full mt-5 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all flex-shrink-0">
              حفظ البيانات
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
