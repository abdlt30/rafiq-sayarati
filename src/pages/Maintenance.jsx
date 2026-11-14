import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Link } from 'react-router-dom'; // ✅ إضافة Link للربط مع صفحة المساعدة
import { 
  Plus, Trash2, Edit2, X, Wrench, Gauge, Settings2, 
  AlertCircle, CheckCircle, Check, MapPin, ChevronLeft 
} from 'lucide-react'; // ✅ إضافة أيقونات جديدة

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx'; 
import OptionPicker from '../shared/components/ui/OptionPicker.jsx'; 
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { date: '', type: '', cost: '', nextKm: '' };

export default function Maintenance() {
  const { currentCar, t, currency, lang, dataVersion, bumpDataVersion } = useContext(AppContext);
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const iceTypes = useMemo(() => [{ value: 'oilChange', label: t('engineOil') || 'زيت المحرك' }, { value: 'oilFilter', label: t('oilFilter') || 'فلتر الزيت' }, { value: 'airFilter', label: t('airFilter') || 'فلتر الهواء' }, { value: 'cabinFilter', label: t('cabinFilter') || 'فلتر المكيف' }, { value: 'sparkPlugs', label: t('sparkPlugs') || 'شمعات الاحتراق' }, { value: 'timingBelt', label: t('timingBelt') || 'سير التوقيت' }, { value: 'fuelFilter', label: t('fuelFilter') || 'فلتر الوقود' }, { value: 'coolant', label: t('coolant') || 'سائل التبريد' }, { value: 'brakeFluid', label: t('brakeFluid') || 'زيت الفرامل' }, { value: 'transmissionOil', label: t('transmissionOil') || 'زيت القير' }, { value: 'battery12v', label: t('battery12v') || 'بطارية 12V' }, { value: 'tires', label: t('tires') || 'إطارات' }, { value: 'brakes', label: t('brakes') || 'فرامل' }, { value: 'fullInspection', label: t('fullInspection') || 'فحص شامل' }, { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }], [t]);
  const evTypes = useMemo(() => [{ value: 'batteryCheck', label: t('batteryCheck') || 'فحص البطارية' }, { value: 'softwareUpdate', label: t('softwareUpdate') || 'تحديث برمجي' }, { value: 'coolant', label: t('coolant') || 'سائل التبريد' }, { value: 'brakeFluid', label: t('brakeFluid') || 'زيت الفرامل' }, { value: 'transmissionOil', label: t('transmissionOil') || 'زيت القير' }, { value: 'cabinFilter', label: t('cabinFilter') || 'فلتر المكيف' }, { value: 'tires', label: t('tires') || 'إطارات' }, { value: 'brakes', label: t('brakes') || 'فرامل' }, { value: 'fullInspection', label: t('fullInspection') || 'فحص شامل' }, { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }], [t]);
  const truckExtras = useMemo(() => [{ value: 'airBrakes', label: t('airBrakes') || 'فرامل هوائية' }, { value: 'adBlue', label: t('adBlue') || 'سائل AdBlue' }, { value: 'chassisLubrication', label: t('chassisLubrication') || 'تشحيم الشاسيه' }, { value: 'engineHours', label: t('engineHours') || 'ساعات المحرك' }], [t]);

  const baseTypes = useMemo(() => {
    if (isElectric) return evTypes;
    if (isHybrid) return [...iceTypes.filter(i => i.value !== 'otherMaintenance'), ...evTypes.filter(i => ['batteryCheck', 'softwareUpdate', 'transmissionOil'].includes(i.value)), { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }];
    if (isTruck) return [...iceTypes.filter(i => i.value !== 'otherMaintenance'), ...truckExtras, { value: 'otherMaintenance', label: t('otherMaintenance') || 'أخرى' }];
    return iceTypes;
  }, [isElectric, isHybrid, isTruck, iceTypes, evTypes, truckExtras, t]);

  const allTypes = useMemo(() => {
    const custom = (customTypes || []).map(ct => ({ value: ct, label: ct }));
    return [...baseTypes, ...custom];
  }, [baseTypes, customTypes]);

  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!currentCar) return;
      const allMaintenance = await dbService.getMaintenance();
      const carMaintenance = (allMaintenance || []).filter(r => String(r.carId) === String(currentCar.id));
      setRecords([...carMaintenance].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
      const types = await dbService.getCustomTypes();
      setCustomTypes(Array.isArray(types) ? types : []);
    } catch (e) { console.error(e); setRecords([]); } finally { setIsLoading(false); }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  const totalCost = useMemo(() => records.reduce((sum, r) => sum + safeNumber(r.cost), 0), [records]);

  const handleConfirmAddType = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) return;
    if (allTypes.some(t => t.label.toLowerCase() === trimmed.toLowerCase())) {
      return showToast(t('typeAlreadyExists') || 'هذا النوع موجود بالفعل', 'error');
    }
    try {
      const updatedTypes = await dbService.addCustomType(trimmed);
      setCustomTypes(Array.isArray(updatedTypes) ? updatedTypes : []);
      setFormData(prev => ({ ...prev, type: trimmed }));
      setIsAddingType(false);
      setNewTypeName('');
    } catch (e) {
      showToast(t('errorSaving') || 'حدث خطأ أثناء الإضافة', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar || !formData.date || !formData.type || !formData.cost) return showToast(t('fillRequiredFields') || 'الرجاء تعبئة الحقول', 'error');
    const data = { carId: currentCar.id, date: formData.date, type: formData.type, cost: Number(formData.cost), nextKm: formData.nextKm ? Number(formData.nextKm) : null };
    try {
      if (editingId) await dbService.updateMaintenance(editingId, data);
      else await dbService.addMaintenance(data);
      await loadData(); bumpDataVersion(); closeModal(); showToast(t('saveSuccess') || 'تم الحفظ بنجاح', 'success');
    } catch (error) { showToast(t('errorSaving') || 'حدث خطأ', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await dbService.deleteMaintenance(deleteId); await loadData(); bumpDataVersion(); setDeleteId(null); } catch (e) { showToast(t('errorSaving') || 'حدث خطأ', 'error'); setDeleteId(null); }
  };

  const openAddModal = () => { 
    setEditingId(null); 
    setFormData({ date: new Date().toISOString().split('T')[0], type: baseTypes[0]?.value || 'otherMaintenance', cost: '', nextKm: '' }); 
    setIsAddingType(false); setNewTypeName('');
    setIsModalOpen(true); 
  };
  
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setIsAddingType(false); setNewTypeName(''); };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-[var(--surface-2)] rounded-lg w-1/3 mb-6"></div>
        <div className="h-24 bg-[var(--surface-2)] rounded-2xl"></div>
        <div className="h-20 bg-[var(--surface-2)] rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-2 opacity-70"><X size={16} /></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('maintenance') || 'الصيانة'}</h1>
      </div>

      {/* ✅ إضافة الرابط الذكي للبحث عن ورشة إصلاح */}
      <Link to="/assistance" className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl mb-3 active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-500 rounded-xl"><Wrench size={18} /></div>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">{t('findRepairShop') || 'أقرب ورشة إصلاح'}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{t('nearbyStations') || 'ابحث عن ورش قريبة منك على الخريطة'}</p>
          </div>
        </div>
        <ChevronLeft size={18} className="text-blue-500 rtl:rotate-0 ltr:rotate-180" />
      </Link>

      {/* بطاقة الإجمالي */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 p-4 rounded-2xl mb-2">
        <span className="text-xs text-[var(--text-muted)] block mb-1">{t('totalMaintenanceCost') || 'إجمالي مصاريف الصيانة'}</span>
        <span className="text-2xl font-extrabold text-yellow-500">{totalCost.toLocaleString()} <span className="text-sm font-normal">{currency}</span></span>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-16 p-6 text-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <Wrench size={36} className="text-yellow-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">{t('proactiveMaintenance') || 'صيانة استباقية'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">{t('noMaintenanceRecords') || 'لا توجد سجلات صيانة.'} أضف أول صيانة للحفاظ على سيارتك.</p>
          <button onClick={openAddModal} className="flex items-center gap-2 text-white bg-[var(--primary)] px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg">
            <Plus size={18} /> {t('addMaintenance') || 'إضافة صيانة'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-yellow-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0"><Wrench size={18} /></div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm">{allTypes.find(dt => dt.value === record.type)?.label || record.type}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{formatDate(record.date, todayLocale)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="font-extrabold text-[var(--primary)] text-sm">{safeNumber(record.cost).toLocaleString()} <span className="text-[10px] font-normal">{currency}</span></p>
                  {record.nextKm && safeNumber(record.nextKm) > 0 ? <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-end gap-1 mt-0.5"><Gauge size={10} /> {safeNumber(record.nextKm).toLocaleString()} {t('km') || 'كم'}</p> : <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t('noNextMaintenance') || 'لا توجد صيانة قادمة'}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => { setEditingId(record.id); setFormData({ date: record.date, type: record.type, cost: String(record.cost), nextKm: String(record.nextKm || '') }); setIsModalOpen(true); }} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg active:scale-90"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg active:scale-90"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {records.length > 0 && (
        <button type="button" onClick={openAddModal} className="fixed bottom-24 right-6 rtl:left-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"><Plus size={28} /></button>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={t('confirmDelete') || 'تأكيد الحذف'} message={t('confirmDeleteMsg') || 'هل أنت متأكد من الحذف؟'} variant="danger" confirmText={t('confirmDeleteBtn') || 'حذف'} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 rtl:right-4 p-1.5 bg-[var(--surface-2)] rounded-full z-10"><X size={20} /></button>
            <h2 className="text-lg font-bold text-center mb-5 mt-1">{editingId ? (t('edit') || 'تعديل') : (t('addMaintenance') || 'إضافة صيانة')}</h2>
            
            <div className="space-y-3">
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">{t('date') || 'التاريخ'}</label><input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm [color-scheme:dark]" /></div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-[var(--text-muted)] block">{t('maintenanceType') || 'نوع الصيانة'}</label>
                  {!isAddingType && (
                    <button type="button" onClick={() => setIsAddingType(true)} className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline">
                      <Settings2 size={12} /> {t('addType') || 'إضافة نوع'}
                    </button>
                  )}
                </div>
                
                {isAddingType ? (
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder={t('enterCustomTypeName') || 'أدخل اسم النوع الجديد...'} className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 text-sm outline-none focus:border-[var(--primary)]" autoFocus />
                    <button type="button" onClick={handleConfirmAddType} className="bg-green-500 text-white p-2 rounded-xl active:scale-90"><Check size={18} /></button>
                    <button type="button" onClick={() => { setIsAddingType(false); setNewTypeName(''); }} className="bg-red-500/20 text-red-500 p-2 rounded-xl active:scale-90"><X size={18} /></button>
                  </div>
                ) : (
                  <OptionPicker options={allTypes} value={formData.type} onChange={(val) => setFormData(prev => ({...prev, type: val}))} />
                )}
              </div>

              <div><label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">{t('cost') || 'التكلفة'} ({currency})</label><input type="number" step="0.01" value={formData.cost} onChange={e => setFormData(prev => ({...prev, cost: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold" /></div>
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">{t('nextOdometer') || 'العداد للصيانة القادمة'} ({t('km') || 'كم'})</label><input type="number" value={formData.nextKm} onChange={e => setFormData(prev => ({...prev, nextKm: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm" placeholder={t('optional') || 'اختياري'} /></div>
            </div>
            <button type="submit" className="w-full mt-5 bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95">{t('save') || 'حفظ'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
