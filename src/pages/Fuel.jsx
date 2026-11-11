import { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity, Zap, BatteryCharging } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal'; 
import OptionPicker from '../components/ui/OptionPicker'; // ✅ استدعاء القائمة المخصصة

export default function Fuel() {
  const { currentCar, updateCar, t, currency } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  
  // ✅ إضافة حقل energyType للنموذج لدعم الهجين
  const [formData, setFormData] = useState({ date: '', odometer: '', energyType: 'gasoline', amount: '', cost: '' });

  const isElectric = currentCar?.powertrain === 'ev';
  const isHybrid = currentCar?.powertrain === 'hybrid';
  
  // خيارات مصدر الطاقة للسيارات الهجينة
  const energyOptions = [
    { value: 'gasoline', label: t('gasoline') || 'بنزين' },
    { value: 'electricity', label: t('electricity') || 'كهرباء (شحن)' }
  ];

  const loadData = () => {
    if (currentCar) {
      const allFuel = dbService.getFuel()?.filter(r => r.carId === currentCar.id) || [];
      setRecords(allFuel.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setRecords([]); 
    }
  };

  useEffect(() => { loadData(); }, [currentCar]);

  const recordsWithConsumption = useMemo(() => {
    if (records.length === 0) return [];
    const sortedByOdometer = [...records].sort((a, b) => Number(a.odometer) - Number(b.odometer));
    
    const calculated = sortedByOdometer.map((record, index) => {
      let consumption = null;
      if (index > 0) {
        const prevRecord = sortedByOdometer[index - 1];
        const distance = Number(record.odometer) - Number(prevRecord.odometer);
        // حساب الاستهلاك فقط إذا كان نفس النوع (بنزين مع بنزين، كهرباء مع كهرباء)
        if (distance > 0 && Number(record.amount) > 0 && record.energyType === prevRecord.energyType) {
          consumption = ((Number(record.amount) / distance) * 100).toFixed(1);
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
      energyType: isElectric ? 'electricity' : (isHybrid ? formData.energyType : 'gasoline'),
      amount: Number(formData.amount), // نخزن اللترات أو kWh هنا
      cost: Number(formData.cost) 
    };
    
    try {
      if (editingId) {
        dbService.updateFuel(editingId, data);
      } else {
        dbService.addFuel(data);
      }

      if (data.odometer > (currentCar.odometer || 0)) {
        updateCar(currentCar.id, { odometer: data.odometer });
      }

      loadData(); 
      closeModal();
    } catch (error) {
      console.error("خطأ أثناء حفظ البيانات:", error);
      alert("حدث خطأ أثناء الحفظ.");
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
    setFormData({ 
      date: record.date, 
      odometer: record.odometer, 
      energyType: record.energyType || 'gasoline',
      amount: record.amount || record.liters, // دعم البيانات القديمة
      cost: record.cost 
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      odometer: currentCar?.odometer || '', 
      energyType: 'gasoline',
      amount: '', 
      cost: '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', odometer: '', energyType: 'gasoline', amount: '', cost: '' });
  };

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {isElectric ? (t('chargingLog') || 'سجل الشحن') : (t('fuel') || 'سجل الوقود')}
        </h1>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            {isElectric ? <BatteryCharging size={48} className="opacity-40" /> : <FuelIcon size={48} className="opacity-40" />}
          </div>
          <p>{isElectric ? (t('noChargingRecords') || 'لا توجد سجلات شحن.') : (t('noFuelRecords') || 'لا توجد سجلات وقود.')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recordsWithConsumption.map(record => {
            const isEnergyElectric = record.energyType === 'electricity';
            const unit = isEnergyElectric ? 'kWh' : 'L';
            
            return (
              <div key={record.id} className={`bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm transition-colors ${isEnergyElectric ? 'hover:border-green-500/30' : 'hover:border-blue-500/30'}`}>
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEnergyElectric ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {isEnergyElectric ? <Zap size={18} /> : <FuelIcon size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-sm">
                      {Number(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{record.date} • {record.amount} {unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center justify-end gap-1">
                      <Gauge size={10} /> {Number(record.odometer).toLocaleString()} KM
                    </p>
                    {record.consumption ? (
                      <p className={`text-[10px] font-bold mt-1 flex items-center justify-end gap-1 ${isEnergyElectric ? 'text-green-500' : 'text-blue-500'}`}>
                        <Activity size={10} /> {record.consumption} {isEnergyElectric ? 'kWh/100km' : 'L/100km'}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{isEnergyElectric ? 'أول شحن' : 'أول تعبئة'}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => openEdit(record)} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <button 
        onClick={openAddModal} 
        className={`fixed bottom-24 right-6 rtl:left-6 rtl:auto w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 ${isElectric ? 'bg-green-500 shadow-green-500/40' : 'bg-[var(--primary)] shadow-blue-500/40'}`}
      >
        <Plus size={28} />
      </button>

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message="هل أنت متأكد من حذف هذا السجل؟"
        variant="danger"
        confirmText={t('confirmDeleteBtn') || 'نعم، احذف'}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors z-10">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? (t('edit') || 'تعديل') : (isElectric ? (t('addCharging') || 'إضافة شحن') : (t('addFuel') || 'إضافة تعبئة'))}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>
              
              {/* ✅ اختيار مصدر الطاقة للسيارات الهجينة فقط */}
              {isHybrid && (
                <div className="animate-fade-in">
                  <OptionPicker 
                    label={t('energySource') || 'مصدر الطاقة'} 
                    options={energyOptions} 
                    value={formData.energyType} 
                    onChange={(val) => setFormData({...formData, energyType: val})} 
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('odometer') || 'العداد'} (KM)</label>
                <input type="number" inputMode="numeric" min="0" required placeholder="0" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">
                  {(isElectric || formData.energyType === 'electricity') ? (t('kwh') || 'كيلوواط/ساعة (kWh)') : (t('liters') || 'اللترات')}
                </label>
                <input type="number" inputMode="decimal" min="0" step="0.01" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('cost') || 'التكلفة'} ({currency})</label>
                <input type="number" inputMode="decimal" min="0" step="0.01" required placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
            
            <button type="submit" className={`w-full mt-5 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all flex-shrink-0 ${isElectric || formData.energyType === 'electricity' ? 'bg-green-500 hover:bg-green-600' : 'bg-[var(--primary)] hover:bg-blue-600'}`}>
              {t('save') || 'حفظ البيانات'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
