import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity, Zap, BatteryCharging, AlertCircle, CheckCircle } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal'; 
import OptionPicker from '../components/ui/OptionPicker'; 

const EMPTY_FORM = { date: '', odometer: '', energyType: 'gasoline', amount: '', cost: '' };

export default function Fuel() {
  const { currentCar, updateCar, t, currency, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState(EMPTY_FORM);

  const toastTimeoutRef = useRef(null);

  const powertrain = currentCar?.powertrain || 'ice'; 
  const isElectric = powertrain === 'ev';
  const isHybrid = powertrain === 'hybrid' || powertrain === 'phev';

  const energyOptions = [
    { value: 'gasoline', label: t('gasoline') || 'بنزين' },
    { value: 'electricity', label: t('electricity') || 'كهرباء (شحن)' }
  ];

  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  const loadData = useCallback(() => {
    try {
      if (currentCar) {
        // ✅ إصلاح: استخدام String() للتطابق
        const allFuel = dbService.getFuel()?.filter(r => String(r.carId) === String(currentCar.id)) || [];
        // ✅ ترتيب مستقر
        setRecords([...allFuel].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))));
      } else {
        setRecords([]); 
      }
    } catch (e) {
      console.error('loadData failed:', e);
      setRecords([]);
    }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  const recordsWithConsumption = useMemo(() => {
    if (records.length === 0) return [];

    const groups = {};
    records.forEach(r => {
      const e = r.energyType || 'gasoline';
      (groups[e] = groups[e] || []).push(r);
    });

    const consumptionById = {};
    Object.values(groups).forEach(group => {
      const sorted = [...group].sort((a, b) => Number(a.odometer) - Number(b.odometer));
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const distance = Number(curr.odometer) - Number(prev.odometer);
        const amount = Number(curr.amount ?? curr.liters) || 0;
        if (Number.isFinite(distance) && distance > 0 && amount > 0) {
          const c = (amount / distance) * 100;
          if (Number.isFinite(c) && c > 0) {
            consumptionById[curr.id] = c.toFixed(1);
          }
        }
      }
    });

    return records
      .map(r => ({ ...r, consumption: consumptionById[r.id] ?? null }))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }, [records]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentCar) return;

    const isBlank = (v) => v === '' || v === undefined || v === null;
    if (!formData.date || isBlank(formData.odometer) || isBlank(formData.amount) || isBlank(formData.cost)) {
      return showToast(t('fillRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة.', 'error');
    }

    const odoNum = Number(formData.odometer);
    const amountNum = Number(formData.amount);
    const costNum = Number(formData.cost);

    if (!Number.isFinite(odoNum) || !Number.isFinite(amountNum) || !Number.isFinite(costNum) ||
        odoNum < 0 || amountNum <= 0 || costNum < 0) {
      return showToast(t('invalidNumbers') || 'الرجاء إدخال أرقام صحيحة أكبر من صفر.', 'error');
    }

    if (!editingId) {
      const maxFuelOdo = records.reduce((m, r) => Math.max(m, Number(r.odometer) || 0), 0);
      const maxOdo = Math.max(Number(currentCar.odometer) || 0, maxFuelOdo);
      if (odoNum < maxOdo) {
        return showToast(t('invalidOdometer') || 'العداد لا يمكن أن يكون أقل من العداد السابق.', 'error');
      }
    }

    let finalEnergyType = 'gasoline';
    if (isElectric) finalEnergyType = 'electricity';
    else if (isHybrid) finalEnergyType = formData.energyType;

    const data = { 
      carId: currentCar.id, 
      date: formData.date,
      odometer: odoNum, 
      energyType: finalEnergyType,
      amount: amountNum, 
      cost: costNum 
    };
    
    try {
      if (editingId) {
        dbService.updateFuel(editingId, data);
      } else {
        dbService.addFuel(data);
      }

      if (data.odometer > (Number(currentCar.odometer) || 0)) {
        updateCar(currentCar.id, { odometer: data.odometer });
      } else {
        bumpDataVersion();
      }

      loadData(); 
      closeModal();
      showToast(t('saveSuccess') || 'تم حفظ البيانات بنجاح!', 'success');
    } catch (error) {
      console.error("خطأ أثناء حفظ البيانات:", error);
      showToast(t('errorSaving') || "حدث خطأ أثناء الحفظ.", 'error');
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    try {
      dbService.deleteFuel(deleteId);
      loadData();
      bumpDataVersion();
      setDeleteId(null); 
    } catch (e) {
      console.error('deleteFuel failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving') || 'حدث خطأ أثناء الحذف.', 'error');
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ 
      date: record.date || '', 
      odometer: record.odometer != null ? String(record.odometer) : '', 
      energyType: record.energyType || (isElectric ? 'electricity' : 'gasoline'),
      amount: (record.amount ?? record.liters) != null ? String(record.amount ?? record.liters) : '',
      cost: record.cost != null ? String(record.cost) : ''
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      odometer: currentCar?.odometer != null ? String(currentCar.odometer) : '',
      energyType: isElectric ? 'electricity' : 'gasoline',
      amount: '', 
      cost: '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={dismissToast} 
            aria-label="إغلاق الإشعار"
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

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
            const amountToShow = record.amount ?? record.liters;
            
            return (
              <div key={record.id} className={`bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm transition-colors ${isEnergyElectric ? 'hover:border-green-500/30' : 'hover:border-blue-500/30'}`}>
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEnergyElectric ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {isEnergyElectric ? <Zap size={18} /> : <FuelIcon size={18} />}
                  </div>
                  <div>
                    {/* ✅ إصلاح NaN: إضافة || 0 */}
                    <p className="font-bold text-[var(--text)] text-sm">
                      {Number(record.cost || 0).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{record.date} • {amountToShow} {unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center justify-end gap-1">
                      {/* ✅ إصلاح NaN: إضافة || 0 */}
                      <Gauge size={10} /> {Number(record.odometer || 0).toLocaleString()} KM
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
                    <button 
                      type="button"
                      onClick={() => openEdit(record)} 
                      aria-label="تعديل السجل"
                      className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteId(record.id)} 
                      aria-label="حذف السجل"
                      className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ✅ إصلاح rtl:auto -> rtl:right-auto */}
      <button 
        type="button"
        onClick={openAddModal} 
        aria-label="إضافة سجل جديد"
        className={`fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 ${isElectric ? 'bg-green-500 shadow-green-500/40' : 'bg-[var(--primary)] shadow-blue-500/40'}`}
      >
        <Plus size={28} />
      </button>

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف هذا السجل؟'}
        variant="danger"
        confirmText={t('confirmDeleteBtn') || 'نعم، احذف'}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} noValidate className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            {/* ✅ إصلاح RTL لزر الإغلاق */}
            <button 
              type="button" 
              onClick={closeModal} 
              aria-label="إغلاق"
              className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? (t('edit') || 'تعديل') : (isElectric ? (t('addCharging') || 'إضافة شحن') : (t('addFuel') || 'إضافة تعبئة'))}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>
              
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
                <input type="number" inputMode="numeric" min="0" placeholder="0" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">
                  {(isElectric || formData.energyType === 'electricity') ? (t('kwh') || 'كيلوواط/ساعة (kWh)') : (t('liters') || 'اللترات')}
                </label>
                <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('cost') || 'التكلفة'} ({currency})</label>
                <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" />
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
