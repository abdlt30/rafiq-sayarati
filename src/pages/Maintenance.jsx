import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wrench, Gauge, Settings2, AlertCircle, CheckCircle, Check } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal'; 
import OptionPicker from '../components/ui/OptionPicker'; 

const EMPTY_FORM = { date: '', type: '', cost: '', nextKm: '' };

export default function Maintenance() {
  const { currentCar, t, currency, dataVersion, bumpDataVersion } = useContext(AppContext);
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [customTypes, setCustomTypes] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // ✅ حالة جديدة لإضافة نوع مخصص بدون window.prompt
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const toastTimeoutRef = useRef(null);

  /* ✅ 1. تحديد نوع السيارة */
  const isElectric = currentCar?.powertrain === 'ev';
  const isHybrid = currentCar?.powertrain === 'hybrid' || currentCar?.powertrain === 'phev';
  const isTruck = currentCar?.category === 'truck';

  /* ✅ 2. قوائم الصيانة */
  const iceTypes = useMemo(() => [
    { value: 'oilChange', label: t('engineOil') || 'زيت المحرك' },
    { value: 'oilFilter', label: t('oilFilter') || 'فلتر الزيت' },
    { value: 'airFilter', label: t('airFilter') || 'فلتر الهواء' },
    { value: 'cabinFilter', label: t('cabinFilter') || 'فلتر هواء المقصورة' },
    { value: 'sparkPlugs', label: t('sparkPlugs') || 'شمعات الاحتراق' },
    { value: 'timingBelt', label: t('timingBelt') || 'سير التوقيت' },
    { value: 'fuelFilter', label: t('fuelFilter') || 'فلتر الوقود' },
    { value: 'coolant', label: t('coolant') || 'سائل التبريد' },
    { value: 'brakeFluid', label: t('brakeFluid') || 'سائل الفرامل' },
    { value: 'transmissionOil', label: t('transmissionOil') || 'زيت ناقل الحركة' },
    { value: 'battery12v', label: t('battery12v') || 'بطارية 12V' },
    { value: 'tires', label: t('tires') || 'إطارات' },
    { value: 'brakes', label: t('brakes') || 'فرامل' },
    { value: 'fullInspection', label: t('fullInspection') || 'فحص شامل' },
    { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }
  ], [t]);

  const evTypes = useMemo(() => [
    { value: 'batteryCheck', label: t('batteryCheck') || 'فحص البطارية الرئيسية' },
    { value: 'softwareUpdate', label: t('softwareUpdate') || 'تحديث برمجي' },
    { value: 'coolant', label: t('coolant') || 'سائل التبريد' },
    { value: 'brakeFluid', label: t('brakeFluid') || 'سائل الفرامل' },
    { value: 'transmissionOil', label: t('transmissionOil') || 'زيت ناقل الحركة (أحادي)' },
    { value: 'cabinFilter', label: t('cabinFilter') || 'فلتر هواء المقصورة' },
    { value: 'tires', label: t('tires') || 'إطارات' },
    { value: 'brakes', label: t('brakes') || 'فرامل' },
    { value: 'fullInspection', label: t('fullInspection') || 'فحص شامل' },
    { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }
  ], [t]);

  const truckExtras = useMemo(() => [
    { value: 'airBrakes', label: t('airBrakes') || 'فرامل هوائية' },
    { value: 'adBlue', label: t('adBlue') || 'سائل AdBlue' },
    { value: 'chassisLubrication', label: t('chassisLubrication') || 'تشحيم الشاسيه' },
    { value: 'engineHours', label: t('engineHours') || 'ساعات المحرك' }
  ], [t]);

  /* ✅ 3. دمج القوائم حسب نوع السيارة */
  const baseTypes = useMemo(() => {
    if (isElectric) return evTypes;
    if (isHybrid) {
      return [
        ...iceTypes.filter(i => i.value !== 'otherMaintenance'),
        ...evTypes.filter(i => ['batteryCheck', 'softwareUpdate', 'transmissionOil'].includes(i.value)),
        { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }
      ];
    }
    if (isTruck) {
      return [
        ...iceTypes.filter(i => i.value !== 'otherMaintenance'),
        ...truckExtras,
        { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }
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

  /* ===================== Load Data ===================== */
  const loadData = useCallback(() => {
    try {
      if (!currentCar) {
        setRecords([]);
        setCustomTypes([]);
        return;
      }
      const allMaintenance = dbService.getMaintenance() || [];
      
      // ✅ إصلاح أمني: استخدام String() لضمان التطابق
      const carMaintenance = allMaintenance.filter(r => String(r.carId) === String(currentCar.id));
      
      const sorted = [...carMaintenance].sort((a, b) =>
        (b.date || '').localeCompare(a.date || '')
      );
      setRecords(sorted);

      const types = dbService.getCustomTypes() || [];
      setCustomTypes(Array.isArray(types) ? types : []);
    } catch (e) {
      console.error('loadData failed:', e);
      setRecords([]);
      setCustomTypes([]);
    }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  /* ===================== ✅ إضافة نوع مخصص (بدون prompt) ===================== */
  const handleConfirmAddType = () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) return;

    // منع التكرار (case-insensitive)
    const exists = allTypes.some(t => t.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(t('typeAlreadyExists') || 'هذا النوع موجود بالفعل.', 'error');
      return;
    }

    try {
      const updatedTypes = dbService.addCustomType(trimmed);
      setCustomTypes(Array.isArray(updatedTypes) ? updatedTypes : []);
      setFormData(prev => ({ ...prev, type: trimmed }));
      setIsAddingType(false);
      setNewTypeName('');
    } catch (e) {
      console.error('addCustomType failed:', e);
      showToast(t('errorSaving') || 'حدث خطأ أثناء الإضافة.', 'error');
    }
  };

  /* ===================== Save ===================== */
  const handleSave = (e) => {
    e.preventDefault();
    if (!currentCar) return;

    const isBlank = (v) => v === '' || v === undefined || v === null;
    if (isBlank(formData.date) || isBlank(formData.type) || isBlank(formData.cost)) {
      return showToast(t('fillRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة.', 'error');
    }

    const costNum = Number(formData.cost);
    if (!Number.isFinite(costNum) || costNum < 0) {
      return showToast(t('invalidNumbers') || 'الرجاء إدخال أرقام صحيحة.', 'error');
    }

    let nextKmNum = null;
    if (!isBlank(formData.nextKm)) {
      const n = Number(formData.nextKm);
      if (!Number.isFinite(n) || n < 0) {
        return showToast(t('invalidNumbers') || 'الرجاء إدخال عداد صحيح للصيانة القادمة.', 'error');
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
      if (editingId) {
        dbService.updateMaintenance(editingId, data);
      } else {
        dbService.addMaintenance(data);
      }
      loadData();
      bumpDataVersion();
      closeModal();
      showToast(t('saveSuccess') || 'تم الحفظ بنجاح!', 'success');
    } catch (error) {
      console.error("خطأ في حفظ الصيانة:", error);
      showToast(t('errorSaving') || 'حدث خطأ أثناء الحفظ.', 'error');
    }
  };

  /* ===================== Delete ===================== */
  const handleDelete = () => {
    if (!deleteId) return;
    try {
      dbService.deleteMaintenance(deleteId);
      loadData();
      bumpDataVersion();
      setDeleteId(null);
    } catch (e) {
      console.error('deleteMaintenance failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving') || 'حدث خطأ أثناء الحذف.', 'error');
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

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={dismissToast} 
            aria-label="إغلاق"
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('maintenance') || 'الصيانة'}</h1>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Wrench size={48} className="opacity-40" />
          </div>
          <p>{t('noMaintenanceRecords') || 'لا توجد سجلات صيانة.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-yellow-500/30 transition-colors">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center flex-shrink-0">
                  <Wrench size={18} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm">
                    {allTypes.find(dt => dt.value === record.type)?.label || record.type}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{record.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="font-extrabold text-[var(--primary)] text-sm">
                    {Number(record.cost || 0).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  {/* ✅ إصلاح منطقي: 0 كم لا يظهر */}
                  {record.nextKm && Number(record.nextKm) > 0 ? (
                    <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-end gap-1 mt-0.5">
                      <Gauge size={10} /> {Number(record.nextKm).toLocaleString()} KM
                    </p>
                  ) : (
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t('noNextMaintenance') || 'لا توجد صيانة قادمة'}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <button 
                    type="button"
                    onClick={() => openEdit(record)} 
                    aria-label={t('edit') || 'تعديل'}
                    className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeleteId(record.id)} 
                    aria-label={t('confirmDelete') || 'حذف'}
                    className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ✅ إصلاح rtl:auto إلى rtl:right-auto */}
      <button 
        type="button"
        onClick={openAddModal} 
        aria-label={t('addMaintenance') || 'إضافة صيانة'}
        className="fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={deleteMessage}
        variant="danger" 
        confirmText={t('confirmDeleteBtn') || 'نعم، احذف'} 
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} noValidate className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button 
              type="button" 
              onClick={closeModal} 
              aria-label="إغلاق"
              className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white active:scale-90 transition-all z-10"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? (t('edit') || 'تعديل الصيانة') : (t('addMaintenance') || 'إضافة صيانة')}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-[var(--text-muted)] block">{t('maintenanceType') || 'نوع الصيانة'}</label>
                  {!isAddingType && (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingType(true)} 
                      className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline"
                    >
                      <Settings2 size={12} /> {t('addType') || 'إضافة نوع'}
                    </button>
                  )}
                </div>
                
                {/* ✅ استبدال window.prompt بحقل إدخال مدمج */}
                {isAddingType ? (
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder={t('enterCustomTypeName') || 'اسم النوع الجديد...'}
                      className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={handleConfirmAddType}
                      className="bg-green-500 text-white p-2 rounded-xl active:scale-90 transition-transform"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsAddingType(false); setNewTypeName(''); }}
                      className="bg-red-500/20 text-red-500 p-2 rounded-xl active:scale-90 transition-transform"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <OptionPicker 
                    options={allTypes} 
                    value={formData.type} 
                    onChange={(val) => setFormData({...formData, type: val})} 
                  />
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('cost') || 'التكلفة'} ({currency})</label>
                <input 
                  type="number" 
                  inputMode="decimal" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={formData.cost} 
                  onChange={e => setFormData({...formData, cost: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('nextOdometer') || 'العداد للصيانة القادمة'} (KM)</label>
                <input 
                  type="number" 
                  inputMode="numeric" 
                  min="0" 
                  step="1" 
                  placeholder={t('optional') || 'اختياري'} 
                  value={formData.nextKm} 
                  onChange={e => setFormData({...formData, nextKm: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
                />
              </div>
            </div>

            <button type="submit" className="w-full mt-5 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all flex-shrink-0">
              {t('save') || 'حفظ البيانات'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
