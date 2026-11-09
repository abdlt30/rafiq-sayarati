import { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity } from 'lucide-react';

export default function Fuel() {
  const { currentCar, t, currency, lang } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', odometer: '', liters: '', cost: '' });

  useEffect(() => {
    if (currentCar) {
      const allFuel = dbService.getFuel().filter(r => r.carId === currentCar.id);
      setRecords(allFuel.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
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
    const data = { carId: currentCar.id, ...formData, odometer: Number(formData.odometer), liters: Number(formData.liters), cost: Number(formData.cost) };
    
    if (editingId) {
      const updated = dbService.updateFuel(editingId, data);
      setRecords(updated.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      const newRecord = dbService.addFuel(data);
      if (newRecord) setRecords([newRecord, ...records].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm(t('confirmDelete') || 'هل أنت متأكد؟')) {
      const updated = dbService.deleteFuel(id);
      setRecords(updated.sort((a, b) => new Date(b.date) - new Date(a.date)));
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

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
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
        <div className="space-y-3">
          {recordsWithConsumption.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3 transition-colors hover:border-blue-500/30 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><FuelIcon size={20}/></div>
                  <div>
                    <p className="font-extrabold text-lg text-[var(--text)]">
                      {Number(record.cost).toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{currency}</span>
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{record.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(record); }} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg hover:bg-blue-400/20 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} className="text-red-400 bg-red-400/10 p-2 rounded-lg hover:bg-red-400/20 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-[var(--surface-2)] p-2.5 rounded-xl text-xs font-medium">
                <span className="text-[var(--text)] flex items-center gap-1"><Gauge size={14} className="text-[var(--text-muted)]"/> {Number(record.odometer).toLocaleString()} KM</span>
                <span className="text-[var(--text)]">{record.liters} L</span>
                
                {record.consumption ? (
                  <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded-md font-bold flex items-center gap-1" title="استهلاك الوقود لكل 100 كم">
                    <Activity size={12} /> {record.consumption} L/100km
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)] text-[10px]">{t('firstFill') || 'أول تعبئة'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ الزر العائم (FAB) الاحترافي للإضافة */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      {/* النافذة المنبثقة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[85vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors z-10">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-center mb-4 text-[var(--text)] mt-2">
              {editingId ? (t('edit') || 'تعديل') : (t('addFuel') || 'إضافة تعبئة')}
            </h2>
            
            <div className="space-y-4 overflow-y-auto pr-1 pb-2">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">{t('odometer') || 'العداد'} (KM)</label>
                <input type="number" required value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">{t('liters') || 'اللترات'}</label>
                <input type="number" step="0.01" required value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">{t('cost') || 'التكلفة'} ({currency})</label>
                <input type="number" step="0.01" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
            
            <button type="submit" className="w-full mt-4 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition-colors flex-shrink-0">
              {t('save') || 'حفظ'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
