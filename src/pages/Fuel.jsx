import { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity } from 'lucide-react';

export default function Fuel() {
  const { currentCar, t, currency } = useContext(AppContext); 
  
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

  // ✅ الحساب الذكي لاستهلاك الوقود L/100km
  const recordsWithConsumption = useMemo(() => {
    if (records.length === 0) return [];
    
    // ترتيب السجلات تصاعدياً حسب العداد لحساب الفروقات
    const sortedByOdometer = [...records].sort((a, b) => Number(a.odometer) - Number(b.odometer));
    
    const calculated = sortedByOdometer.map((record, index) => {
      let consumption = null;
      if (index > 0) {
        const prevRecord = sortedByOdometer[index - 1];
        const distance = Number(record.odometer) - Number(prevRecord.odometer);
        
        // المعادلة: (اللترات / المسافة) * 100
        if (distance > 0 && Number(record.liters) > 0) {
          consumption = ((Number(record.liters) / distance) * 100).toFixed(1);
        }
      }
      return { ...record, consumption };
    });

    // إعادة ترتيبها للعرض (الأحدث أولاً)
    return calculated.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records]);

  // ... (باقي دوال handleSave, handleDelete, openEdit, closeModal كما هي)

  return (
    <div className="space-y-4 pb-24 px-4">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('fuel') || 'سجل الوقود'}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 transition-transform">
          <Plus size={24} />
        </button>
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
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3 transition-colors hover:border-blue-500/30">
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
                  <button onClick={() => openEdit(record)} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg hover:bg-blue-400/20 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg hover:bg-red-400/20 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-[var(--surface-2)] p-2.5 rounded-xl text-xs font-medium">
                <span className="text-[var(--text)] flex items-center gap-1"><Gauge size={14} className="text-[var(--text-muted)]"/> {Number(record.odometer).toLocaleString()} KM</span>
                <span className="text-[var(--text)]">{record.liters} L</span>
                
                {/* ✅ عرض استهلاك الوقود L/100km */}
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

      {/* ... (نافذة الإضافة تبقى كما هي) */}
    </div>
  );
}
