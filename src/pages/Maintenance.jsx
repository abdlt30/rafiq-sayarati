import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
// ✅ إضافة الامتدادات المطلوبة لمنع فشل Vite Build
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Plus, Trash2, Edit2, X, Wrench, Gauge, Settings2, AlertCircle, CheckCircle, Check } from 'lucide-react';

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx'; 
import OptionPicker from '../shared/components/ui/OptionPicker.jsx'; 
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { date: '', type: '', cost: '', nextKm: '' };

export default function Maintenance() {
  const { currentCar, t, currency, lang, dataVersion, bumpDataVersion } = useContext(AppContext);
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✅ حالة تحميل جديدة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [customTypes, setCustomTypes] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const toastTimeoutRef = useRef(null);
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const isElectric = currentCar?.powertrain === 'ev';
  const isHybrid = currentCar?.powertrain === 'hybrid' || currentCar?.powertrain === 'phev';
  const isTruck = currentCar?.category === 'truck';

  const iceTypes = useMemo(() => [
    { value: 'oilChange', label: t('engineOil') },
    { value: 'oilFilter', label: t('oilFilter') },
    { value: 'airFilter', label: t('airFilter') },
    { value: 'cabinFilter', label: t('cabinFilter') },
    { value: 'sparkPlugs', label: t('sparkPlugs') },
    { value: 'timingBelt', label: t('timingBelt') },
    { value: 'fuelFilter', label: t('fuelFilter') },
    { value: 'coolant', label: t('coolant') },
    { value: 'brakeFluid', label: t('brakeFluid') },
    { value: 'transmissionOil', label: t('transmissionOil') },
    { value: 'battery12v', label: t('battery12v') },
    { value: 'tires', label: t('tires') },
    { value: 'brakes', label: t('brakes') },
    { value: 'fullInspection', label: t('fullInspection') },
    { value: 'otherMaintenance', label: t('otherMaintenance') }
  ], [t]);

  const evTypes = useMemo(() => [
    { value: 'batteryCheck', label: t('batteryCheck') },
    { value: 'softwareUpdate', label: t('softwareUpdate') },
    { value: 'coolant', label: t('coolant') },
    { value: 'brakeFluid', label: t('brakeFluid') },
    { value: 'transmissionOil', label: t('transmissionOil') },
    { value: 'cabinFilter', label: t('cabinFilter') },
    { value: 'tires', label: t('tires') },
    { value: 'brakes', label: t('brakes') },
    { value: 'fullInspection', label: t('fullInspection') },
    { value: 'otherMaintenance', label: t('otherMaintenance') }
  ], [t]);

  const truckExtras = useMemo(() => [
    { value: 'airBrakes', label: t('airBrakes') },
    { value: 'adBlue', label: t('adBlue') },
    { value: 'chassisLubrication', label: t('chassisLubrication') },
    { value: 'engineHours', label: t('engineHours') }
  ], [t]);

  const baseTypes = useMemo(() => {
    if (isElectric) return evTypes;
    if (isHybrid) {
      return [
        ...iceTypes.filter(i => i.value !== 'otherMaintenance'),
        ...evTypes.filter(i => ['batteryCheck', 'softwareUpdate', 'transmissionOil'].includes(i.value)),
        { value: 'otherMaintenance', label: t('otherMaintenance') }
      ];
    }
    if (isTruck) {
      return [
        ...iceTypes.filter(i => i.value !== 'otherMaintenance'),
        ...truckExtras,
        { value: 'otherMaintenance', label: t('otherMaintenance') }
      ];
    }
    return iceTypes;
  }, [isElectric, isHybrid, isTruck, iceTypes, evTypes, truckExtras, t]);

  const allTypes = useMemo(() => {
    const custom = (customTypes || []).map(ct => ({ value: ct, label: ct }));
    return [...baseTypes, ...custom];
  }, [baseTypes, customTypes]);

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
      if (!currentCar) {
        setRecords([]);
        setCustomTypes([]);
        return;
      }
      // ✅ إضافة await لأن dbService أصبح يعتمد على IndexedDB
      const allMaintenance = await dbService.getMaintenance();
      const carMaintenance = (allMaintenance || []).filter(r => String(r.carId) === String(currentCar.id));
      const sorted = [...carMaintenance].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setRecords(sorted);

      const types = await dbService.getCustomTypes();
      setCustomTypes(Array.isArray(types) ? types : []);
    } catch (e) {
      console.error('loadData failed:', e);
      setRecords([]);
      setCustomTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  /* ===================== Add Custom Type (Async) ===================== */
  const handleConfirmAddType = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) return;

    const exists = allTypes.some(t => t.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      return showToast(t('typeAlreadyExists'), 'error');
    }

    try {
      // ✅ إضافة await
      const updatedTypes = await dbService.addCustomType(trimmed);
      setCustomTypes(Array.isArray(updatedTypes) ? updatedTypes : []);
      setFormData(prev => ({ ...prev, type: trimmed }));
      setIsAddingType(false);
      setNewTypeName('');
    } catch (e) {
      console.error('addCustomType failed:', e);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== Save (Async) ===================== */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar) return;

    const isBlank = (v) => v === '' || v === undefined || v === null;
    if (isBlank(formData.date) || isBlank(formData.type) || isBlank(formData.cost)) {
      return showToast(t('fillRequiredFields'), 'error');
    }

    const costNum = Number(formData.cost);
    if (!Number.isFinite(costNum) || costNum < 0) {
      return showToast(t('invalidNumbers'), 'error');
    }

    let nextKmNum = null;
    if (!isBlank(formData.nextKm)) {
      const n = Number(formData.nextKm);
      if (!Number.isFinite(n) || n < 0) {
        return showToast(t('invalidNumbers'), 'error');
      }
      nextKmNum = Math.round(n);
    }

    const data = { 
      carId: currentCar.id, 
      date: formData.date,
      type: formData.type,
      cost: costNum,
      nextKm: nextKmNum
    };
    
    try {
      // ✅ إضافة await لدوال قاعدة البيانات
      if (editingId) {
        await dbService.updateMaintenance(editingId, data);
      } else {
        await dbService.addMaintenance(data);
      }
      await loadData();
      bumpDataVersion();
      closeModal();
      showToast(t('saveSuccess'), 'success');
    } catch (error) {
      console.error("خطأ في حفظ الصيانة:", error);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== Delete (Async) ===================== */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dbService.deleteMaintenance(deleteId); // ✅ إضافة await
      await loadData();
      bumpDataVersion();
      setDeleteId(null);
    } catch (e) {
      console.error('deleteMaintenance failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== Modals ===================== */
  const defaultType = baseTypes[0]?.value || 'otherMaintenance';

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      type: defaultType,
      cost: '', 
      nextKm: '' 
    });
    setIsAddingType(false);
    setNewTypeName('');
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ 
      date: record.date || '', 
      type: record.type || defaultType, 
      cost: record.cost != null ? String(record.cost) : '', 
      nextKm: record.nextKm != null ? String(record.nextKm) : '' 
    });
    setIsAddingType(false);
    setNewTypeName('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsAddingType(false);
    setNewTypeName('');
  };

  const deleteMessage = useMemo(() => {
    const msg = t('confirmDeleteMsg');
    return msg === 'confirmDeleteMsg' 
      ? 'هل أنت متأكد من حذف سجل الصيانة هذا؟' 
      : msg;
  }, [t]);

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
          <button 
            type="button"
            onClick={dismissToast} 
            aria-label={t('close')}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('maintenance')}</h1>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Wrench size={48} className="opacity-40" aria-hidden="true" />
          </div>
          <p>{t('noMaintenanceRecords')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-yellow-500/30 transition-colors">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center flex-shrink-0">
                  <Wrench size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm">
                    {allTypes.find(dt => dt.value === record.type)?.label || record.type}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {formatDate(record.date, todayLocale)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="font-extrabold text-[var(--primary)] text-sm">
                    {safeNumber(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  {record.nextKm && safeNumber(record.nextKm) > 0 ? (
                    <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-end gap-1 mt-0.5">
                      <Gauge size={10} aria-hidden="true" /> {safeNumber(record.nextKm).toLocaleString()} {t('km')}
                    </p>
                  ) : (
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t('noNextMaintenance')}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <button 
                    type="button"
                    onClick={() => openEdit(record)} 
                    aria-label={t('edit')}
                    className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"
                  >
                    <Edit2 size={14} aria-hidden="true" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeleteId(record.id)} 
                    aria-label={t('confirmDelete')}
                    className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <button 
        type="button"
        onClick={openAddModal} 
        aria-label={t('addMaintenance')}
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} aria-hidden="true" />
      </button>

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete')}
        message={deleteMessage}
        variant="danger" 
        confirmText={t('confirmDeleteBtn')} 
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} noValidate className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button 
              type="button" 
              onClick={closeModal} 
              aria-label={t('close')}
              className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white active:scale-90 transition-all z-10"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? t('edit') : t('addMaintenance')}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date')}</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-[var(--text-muted)] block">{t('maintenanceType')}</label>
                  {!isAddingType && (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingType(true)} 
                      className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline"
                    >
                      <Settings2 size={12} aria-hidden="true" /> {t('addType')}
                    </button>
                  )}
                </div>
                
                {isAddingType ? (
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder={t('enterCustomTypeName')}
                      className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={handleConfirmAddType}
                      className="bg-green-500 text-white p-2 rounded-xl active:scale-90 transition-transform"
                    >
                      <Check size={18} aria-hidden="true" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsAddingType(false); setNewTypeName(''); }}
                      className="bg-red-500/20 text-red-500 p-2 rounded-xl active:scale-90 transition-transform"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <OptionPicker 
                    options={allTypes} 
                    value={formData.type} 
                    onChange={(val) => setFormData(prev => ({...prev, type: val}))} 
                  />
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('cost')} ({currency})</label>
                <input 
                  type="number" 
                  inputMode="decimal" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={formData.cost} 
                  onChange={e => setFormData(prev => ({...prev, cost: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('nextOdometer')} ({t('km')})</label>
                <input 
                  type="number" 
                  inputMode="numeric" 
                  min="0" 
                  step="1" 
                  placeholder={t('optional')} 
                  value={formData.nextKm} 
                  onChange={e => setFormData(prev => ({...prev, nextKm: e.target.value}))} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>
            </div>

            <button type="submit" className="w-full mt-5 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all flex-shrink-0">
              {t('save')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
