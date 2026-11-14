import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Plus, Trash2, Edit2, X, Fuel as FuelIcon, Gauge, Activity, Zap, BatteryCharging, AlertCircle, CheckCircle, MapPin, Loader2 } from 'lucide-react';

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx'; 
import OptionPicker from '../shared/components/ui/OptionPicker.jsx'; 
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { date: '', odometer: '', energyType: 'gasoline', amount: '', cost: '', station: '' };

export default function Fuel() {
  const { currentCar, updateCar, t, currency, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); 
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState(EMPTY_FORM);

  // 🗺️ حالات جلب الموقع للمحطة
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [showStationPicker, setShowStationPicker] = useState(false);

  const toastTimeoutRef = useRef(null);
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const isElectric = currentCar?.powertrain === 'ev';

  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (currentCar) {
        const allFuel = await dbService.getFuel();
        const carFuel = (allFuel || []).filter(r => String(r.carId) === String(currentCar.id));
        setRecords([...carFuel].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))));
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  /* 🗺️ دالة جلب محطات الوقود القريبة (OpenStreetMap) */
  const handleFindStation = () => {
    if (!navigator.geolocation) return showToast(t('locationNotSupported') || 'متصفحك لا يدعم الموقع', 'error');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const query = `[out:json];node["amenity"="fuel"](around:5000,${latitude},${longitude});out;`;
          const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
          const data = await res.json();
          
          if (data.elements && data.elements.length > 0) {
            const stations = data.elements.slice(0, 6).map(el => ({
              name: el.tags?.name || el.tags?.brand || 'محطة وقود',
              lat: el.lat, lon: el.lon
            }));
            setNearbyStations(stations);
            setShowStationPicker(true);
          } else {
            showToast(t('noStationsFound') || 'لا توجد محطات قريبة.', 'error');
          }
        } catch (error) {
          showToast(t('searchFailed') || 'فشل الاتصال بالخريطة.', 'error');
        } finally {
          setIsLocating(false);
        }
      },
      () => { showToast(t('locationDenied') || 'تم رفض الوصول للموقع.', 'error'); setIsLocating(false); },
      { timeout: 10000 }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar) return;

    if (!formData.date || !formData.odometer || !formData.amount || !formData.cost) {
      return showToast(t('fillRequiredFields'), 'error');
    }
    const data = { carId: currentCar.id, date: formData.date, odometer: Number(formData.odometer), energyType: isElectric ? 'electricity' : 'gasoline', amount: Number(formData.amount), cost: Number(formData.cost), station: formData.station };
    
    try {
      if (editingId) await dbService.updateFuel(editingId, data);
      else await dbService.addFuel(data);

      if (data.odometer > safeNumber(currentCar.odometer)) updateCar(currentCar.id, { odometer: data.odometer });
      else bumpDataVersion();

      await loadData(); closeModal(); showToast(t('saveSuccess'), 'success');
    } catch (error) { showToast(t('errorSaving'), 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dbService.deleteFuel(deleteId);
      await loadData(); bumpDataVersion(); setDeleteId(null);
    } catch (e) { showToast(t('errorSaving'), 'error'); setDeleteId(null); }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ date: new Date().toISOString().split('T')[0], odometer: currentCar?.odometer ? String(currentCar.odometer) : '', energyType: isElectric ? 'electricity' : 'gasoline', amount: '', cost: '', station: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); };

  const recordsWithConsumption = useMemo(() => {
    if (records.length === 0) return [];
    const groups = {};
    records.forEach(r => { const e = r.energyType || 'gasoline'; (groups[e] = groups[e] || []).push(r); });
    const consumptionById = {};
    Object.values(groups).forEach(group => {
      const sorted = [...group].sort((a, b) => safeNumber(a.odometer) - safeNumber(b.odometer));
      for (let i = 1; i < sorted.length; i++) {
        const dist = safeNumber(sorted[i].odometer) - safeNumber(sorted[i - 1].odometer);
        const amt = safeNumber(sorted[i].amount ?? sorted[i].liters);
        if (dist > 0 && amt > 0) consumptionById[sorted[i].id] = ((amt / dist) * 100).toFixed(1);
      }
    });
    return records.map(r => ({ ...r, consumption: consumptionById[r.id] ?? null })).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }, [records]);

  // ✅ 1. شاشة التحميل الهيكلية (Skeleton)
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-[var(--surface-2)] rounded-lg w-1/3 mb-6"></div>
        <div className="h-24 bg-[var(--surface-2)] rounded-2xl"></div>
        <div className="h-24 bg-[var(--surface-2)] rounded-2xl"></div>
        <div className="h-24 bg-[var(--surface-2)] rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-2 opacity-70"><X size={16} /></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{isElectric ? t('chargingLog') : t('fuel')}</h1>
      </div>

      {records.length === 0 ? (
        // ✅ 2. تصميم حالة الفراغ (Empty State) التفاعلي
        <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              {isElectric ? <BatteryCharging size={36} className="text-[var(--primary)]" /> : <FuelIcon size={36} className="text-[var(--primary)]" />}
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">{t('startYourJourney') || 'ابدأ رحلتك!'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">{t('noFuelRecordsDesc') || 'سجل أول تعبئة لتتمكن من تتبع استهلاكك وتوفير المال.'}</p>
          <button onClick={openAddModal} className="flex items-center gap-2 text-white bg-[var(--primary)] px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
            <Plus size={18} /> {isElectric ? t('addCharging') : t('addFuel')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {recordsWithConsumption.map(record => {
            const isEnergyElectric = record.energyType === 'electricity';
            const unit = isEnergyElectric ? 'kWh' : 'L';
            return (
              <div key={record.id} className={`bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm transition-colors ${isEnergyElectric ? 'hover:border-green-500/30' : 'hover:border-blue-500/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEnergyElectric ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {isEnergyElectric ? <Zap size={18} /> : <FuelIcon size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-sm">{safeNumber(record.cost).toLocaleString()} <span className="text-[10px] text-[var(--text-muted)]">{currency}</span></p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{formatDate(record.date, todayLocale)} • {record.amount ?? record.liters} {unit} {record.station ? `• ${record.station}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-end">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center justify-end gap-1"><Gauge size={10} /> {safeNumber(record.odometer).toLocaleString()} {t('km')}</p>
                    {record.consumption ? (
                      <p className={`text-[10px] font-bold mt-1 flex items-center justify-end gap-1 ${isEnergyElectric ? 'text-green-500' : 'text-blue-500'}`}><Activity size={10} /> {record.consumption} {isEnergyElectric ? 'kWh/100km' : 'L/100km'}</p>
                    ) : <p className="text-[10px] text-[var(--text-muted)] mt-1">{t('firstFill')}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => { setEditingId(record.id); setFormData({ date: record.date, odometer: String(record.odometer), energyType: record.energyType || 'gasoline', amount: String(record.amount ?? record.liters), cost: String(record.cost), station: record.station || '' }); setIsModalOpen(true); }} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg active:scale-90"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg active:scale-90"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button type="button" onClick={openAddModal} className={`fixed bottom-24 right-6 rtl:left-6 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center z-40 ${isElectric ? 'bg-green-500' : 'bg-[var(--primary)]'} active:scale-95 transition-transform`}>
        <Plus size={28} />
      </button>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={t('confirmDelete')} message={t('confirmDeleteMsg')} variant="danger" confirmText={t('confirmDeleteBtn')} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 rtl:right-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] z-10"><X size={20} /></button>
            <h2 className="text-lg font-bold text-center mb-5 mt-1">{editingId ? t('edit') : (isElectric ? t('addCharging') : t('addFuel'))}</h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date')}</label><input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm [color-scheme:dark] outline-none" /></div>
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('odometer')}</label><input type="number" value={formData.odometer} onChange={e => setFormData(prev => ({...prev, odometer: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm outline-none" /></div>
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{isElectric ? t('kwh') : t('liters')}</label><input type="number" step="0.01" value={formData.amount} onChange={e => setFormData(prev => ({...prev, amount: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm outline-none" /></div>
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('cost')}</label><input type="number" step="0.01" value={formData.cost} onChange={e => setFormData(prev => ({...prev, cost: e.target.value}))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold outline-none" /></div>
              
              {/* ✅ حقل المحطة مع زر الخريطة */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 flex justify-between items-center">
                  <span>{t('fuelStation')} ({t('optional')})</span>
                  <button type="button" onClick={handleFindStation} disabled={isLocating} className="text-[var(--primary)] flex items-center gap-1 hover:underline">
                    {isLocating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />} 
                    {isLocating ? t('locating') : t('nearbyStations')}
                  </button>
                </label>
                <input type="text" value={formData.station} onChange={e => setFormData(prev => ({...prev, station: e.target.value}))} placeholder="Afriquia, Total..." className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm outline-none" />
              </div>
            </div>
            <button type="submit" className={`w-full mt-5 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 ${isElectric ? 'bg-green-500' : 'bg-[var(--primary)]'}`}>{t('save')}</button>
          </form>
        </div>
      )}

      {/* نافذة اختيار المحطة */}
      {showStationPicker && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-end justify-center backdrop-blur-sm pb-0">
          <div className="bg-[var(--surface)] w-full max-w-md rounded-t-3xl p-5 border-t border-[var(--border)] animate-slide-up">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">{t('nearbyStations')}</h3><button onClick={() => setShowStationPicker(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full"><X size={18}/></button></div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {nearbyStations.map((st, i) => (
                <button key={i} type="button" onClick={() => { setFormData(prev => ({...prev, station: st.name})); setShowStationPicker(false); }} className="w-full text-start p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--primary)] flex items-center gap-3">
                  <MapPin size={20} className="text-[var(--primary)] shrink-0" /><span className="text-sm font-bold truncate">{st.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
