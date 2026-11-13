import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
// ✅ تحديث المسارات وإضافة الامتدادات المطلوبة لـ Vite
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity, Zap, BatteryCharging, AlertCircle, CheckCircle } from 'lucide-react';

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx'; 
import OptionPicker from '../shared/components/ui/OptionPicker.jsx'; 
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { date: '', odometer: '', energyType: 'gasoline', amount: '', cost: '' };

export default function Fuel() {
  const { currentCar, updateCar, t, currency, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ حالة تحميل جديدة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState(EMPTY_FORM);

  const toastTimeoutRef = useRef(null);
  
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const powertrain = currentCar?.powertrain || 'ice'; 
  const isElectric = powertrain === 'ev';
  const isHybrid = powertrain === 'hybrid' || powertrain === 'phev';

  const energyOptions = [
    { value: 'gasoline', label: t('gasoline') },
    { value: 'electricity', label: t('electricity') }
  ];

  /* ===================== Toast ===================== */
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

  /* ===================== Load Data (Async) ===================== */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (currentCar) {
        const allFuel = await dbService.getFuel(); // ✅ أصبحت await
        const carFuel = (allFuel || []).filter(r => String(r.carId) === String(currentCar.id));
        setRecords([...carFuel].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))));
      } else {
        setRecords([]); 
      }
    } catch (e) {
      console.error('loadData failed:', e);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  /* ===================== Math: Consumption ===================== */
  const recordsWithConsumption = useMemo(() => {
    if (records.length === 0) return [];

    const groups = {};
    records.forEach(r => {
      const e = r.energyType || 'gasoline';
      (groups[e] = groups[e] || []).push(r);
    });

    const consumptionById = {};
    Object.values(groups).forEach(group => {
      const sorted = [...group].sort((a, b) => safeNumber(a.odometer) - safeNumber(b.odometer));
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const distance = safeNumber(curr.odometer) - safeNumber(prev.odometer);
        const amount = safeNumber(curr.amount ?? curr.liters);
        if (distance > 0 && amount > 0) {
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

  /* ===================== Save (Async) ===================== */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar) return;

    const isBlank = (v) => v === '' || v === undefined || v === null;
    if (!formData.date || isBlank(formData.odometer) || isBlank(formData.amount) || isBlank(formData.cost)) {
      return showToast(t('fillRequiredFields'), 'error');
    }

    const odoNum = Number(formData.odometer);
    const amountNum = Number(formData.amount);
    const costNum = Number(formData.cost);

    if (!Number.isFinite(odoNum) || !Number.isFinite(amountNum) || !Number.isFinite(costNum) ||
        odoNum < 0 || amountNum <= 0 || costNum < 0) {
      return showToast(t('invalidNumbers'), 'error');
    }

    if (!editingId) {
      const maxFuelOdo = records.reduce((m, r) => Math.max(m, safeNumber(r.odometer)), 0);
      const maxOdo = Math.max(safeNumber(currentCar.odometer), maxFuelOdo);
      if (odoNum < maxOdo) {
        return showToast(t('invalidOdometer'), 'error');
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
      // ✅ إضافة await لدوال قاعدة البيانات
      if (editingId) {
        await dbService.updateFuel(editingId, data);
      } else {
        await dbService.addFuel(data);
      }

      // تحديث العداد في السيارة (متزامن في AppContext حالياً)
      if (data.odometer > safeNumber(currentCar.odometer)) {
        updateCar(currentCar.id, { odometer: data.odometer });
      } else {
        bumpDataVersion();
      }

      await loadData(); // ✅ إعادة جلب البيانات
      closeModal();
      showToast(t('saveSuccess'), 'success');
    } catch (error) {
      console.error("خطأ أثناء حفظ البيانات:", error);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== Delete (Async) ===================== */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dbService.deleteFuel(deleteId); // ✅ أصبحت await
      await loadData();
      bumpDataVersion();
      setDeleteId(null); 
    } catch (e) {
      console.error('deleteFuel failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== Modals ===================== */
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[var(--primary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button type="button" onClick={dismissToast} aria-label={t('close')} className="ml-2 opacity-70 hover:opacity-100">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {isElectric ? t('chargingLog') : t('fuel')}
        </h1>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            {isElectric ? <BatteryCharging size={48} className="opacity-40" aria-hidden="true" /> : <FuelIcon size={48} className="opacity-40" aria-hidden="true" />}
          </div>
          <p>{isElectric ? t('noChargingRecords') : t('noFuelRecords')}</p>
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
                    {isEnergyElectric ? <Zap size={18} aria-hidden="true" /> : <FuelIcon size={18} aria-hidden="true" />}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-sm">
                      {safeNumber(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {formatDate(record.date, todayLocale)} • {amountToShow} {unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center justify-end gap-1">
                      <Gauge size={10} aria-hidden="true" /> {safeNumber(record.odometer).toLocaleString()} {t('km')}
                    </p>
                    {record.consumption ? (
                      <p className={`text-[10px] font-bold mt-1 flex items-center justify-end gap-1 ${isEnergyElectric ? 'text-green-500' : 'text-blue-500'}`}>
                        <Activity size={10} aria-hidden="true" /> {record.consumption} {isEnergyElectric ? 'kWh/100km' : 'L/100km'}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{t('firstFill')}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={() => openEdit(record)} aria-label={t('edit')} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all">
                      <Edit2 size={14} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setDeleteId(record.id)} aria-label={t('confirmDelete')} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all">
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <button 
        type="button"
        onClick={openAddModal} 
        aria-label={isElectric ? t('addCharging') : t('addFuel')}
        className={`fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 ${isElectric ? 'bg-green-500 shadow-green-500/40' : 'bg-[var(--primary)] shadow-blue-500/40'}`}
      >
        <Plus size={28} aria-hidden="true" />
      </button>

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete')}
        message={t('confirmDeleteMsg')}
        variant="danger"
        confirmText={t('confirmDeleteBtn')}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} noValidate className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} aria-label={t('close')} className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors z-10">
              <X size={20} aria-hidden="true" />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? t('edit') : (isElectric ? t('addCharging') : t('addFuel'))}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date')}</label>
                <input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>
              
              {isHybrid && (
                <div className="animate-fade-in">
                  <OptionPicker 
                    label={t('energySource')} 
                    options={energyOptions} 
                    value={formData.energyType} 
                    onChange={(val) => setFormData(prev => ({...prev, energyType: val}))} 
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('odometer')} ({t('km')})</label>
                <input type="number" inputMode="numeric" min="0" placeholder="0" value={formData.odometer} onChange={e => setFormData(prev => ({...prev, odometer: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">
                  {(isElectric || formData.energyType === 'electricity') ? t('kwh') : t('liters')}
                </label>
                <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={formData.amount} onChange={e => setFormData(prev => ({...prev, amount: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('cost')} ({currency})</label>
                <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={formData.cost} onChange={e => setFormData(prev => ({...prev, cost: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
            
            <button type="submit" className={`w-full mt-5 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all flex-shrink-0 ${isElectric || formData.energyType === 'electricity' ? 'bg-green-500 hover:bg-green-600' : 'bg-[var(--primary)] hover:bg-blue-600'}`}>
              {t('save')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
