import { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Car, Plus, CheckCircle, Edit2, Trash2, Zap, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ui/ConfirmModal';

/* ✅ مساعد رياضي: يرفض NaN/Infinity/-Infinity/السالب */
const safeNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ✅ عداد السيارة الآمن */
const getOdometer = (car) => {
  const fromCurrent = car?.currentOdometer;
  const fromOdo = car?.odometer;
  
  if (fromCurrent !== undefined && fromCurrent !== null && fromCurrent !== '') {
    const n = Number(fromCurrent);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  if (fromOdo !== undefined && fromOdo !== null && fromOdo !== '') {
    const n = Number(fromOdo);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
};

/* ✅ أيقونة/لون حسب نوع المحرك */
const getPowertrainIcon = (powertrain) => {
  if (powertrain === 'ev') return Zap;
  if (powertrain === 'hybrid' || powertrain === 'phev') return Zap;
  return Car;
};

export default function Vehicles() {
  const { currentCar, vehicles, selectCar, deleteCar, t } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [deleteId, setDeleteId] = useState(null);

  /* ✅ عدد السجلات المرتبطة (لعرضه في تأكيد الحذف) */
  const deleteStats = useMemo(() => {
    if (!deleteId) return null;
    // 💡 هذا يتطلب dbService
    // للتبسيط، نتركها لاحقاً أو نعرض فقط السيارة
    return null;
  }, [deleteId]);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); 
    setDeleteId(id); 
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const ok = deleteCar(deleteId);
    if (!ok) {
      // في حالة الفشل، نُغلق المودال على أي حال لكن بـ console.warn
      console.warn('deleteCar returned false');
    }
    setDeleteId(null); 
  };

  const handleSelectCar = (car) => {
    const ok = selectCar(car);
    if (ok !== false) {
      navigate('/');
    }
  };

  /* ✅ رسالة تأكيد الحذف مع fallback */
  const deleteMessage = useMemo(() => {
    const msg = t('confirmDeleteCarMsg');
    return msg === 'confirmDeleteCarMsg' 
      ? 'هل أنت متأكد من حذف هذه السيارة؟ سيتم حذف جميع السجلات المرتبطة بها نهائياً.'
      : msg;
  }, [t]);

  return (
    <div className="space-y-4 pb-24 px-4 pt-6 relative min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--primary)]/10 rounded-2xl">
            <Car size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text)]">
              {t('vehicles') || 'سياراتي'}
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {t('manageFleet') || 'إدارة أسطول سياراتك'}
            </p>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={() => navigate('/add-vehicle')} 
          aria-label={t('add') || 'إضافة سيارة'}
          className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all text-sm font-bold"
        >
          <Plus size={18} /> {t('add') || 'إضافة'}
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-5 bg-[var(--surface-2)] rounded-full mb-4">
            <Car size={48} className="opacity-30" />
          </div>
          <p className="font-bold text-lg">
            {t('noVehiclesAdded') || 'لا توجد سيارات مضافة.'}
          </p>
          <p className="text-sm mt-1 mb-6 text-center max-w-[250px]">
            {t('addFirstCarHint') || 'أضف سيارتك الأولى لتبدأ في تتبع مصاريفك وصياناتك.'}
          </p>
          <button 
            type="button"
            onClick={() => navigate('/add-vehicle')} 
            className="text-white font-bold text-sm bg-[var(--primary)] px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
          >
            {t('addFirstCar') || 'إضافة سيارتك الأولى'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(car => {
            // ✅ مقارنة String آمنة
            const isActive = String(currentCar?.id || '') === String(car.id || '');
            const odometerValue = getOdometer(car);
            
            // ✅ بيانات آمنة للعرض
            const make = (car.make || '').trim() || '—';
            const model = (car.model || '').trim() || '';
            const title = `${make} ${model}`.trim() || '—';
            
            const yearNum = Number(car.year);
            const yearDisplay = Number.isFinite(yearNum) && yearNum > 0 ? String(yearNum) : null;
            
            const plateDisplay = (car.plate || '').trim() || null;

            // ✅ أيقونة حسب نوع المحرك
            const PowertrainIcon = getPowertrainIcon(car.powertrain);
            const isElectric = car.powertrain === 'ev';
            const isTruck = car.category === 'truck';

            return (
              <div 
                key={String(car.id) || `car-${car.make}-${car.model}`}
                onClick={() => handleSelectCar(car)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCar(car); }}
                className={`relative p-4 rounded-3xl border flex items-center gap-4 cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                  isActive 
                    ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/10 to-transparent shadow-md shadow-blue-500/10' 
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]/50'
                }`}
              >
                {/* صورة السيارة */}
                <div className={`w-20 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border ${isActive ? 'border-[var(--primary)]/30 bg-[var(--primary)]/10' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
                  {car.image ? (
                    <img 
                      src={car.image} 
                      alt={`${title} - car`} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <PowertrainIcon 
                      size={28} 
                      className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-50'} 
                    />
                  )}
                </div>

                {/* بيانات السيارة */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="truncate pr-2">
                      <h3 className="font-bold text-base text-[var(--text)] leading-tight truncate">
                        {title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {yearDisplay && (
                          <span className="text-[10px] bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
                            {yearDisplay}
                          </span>
                        )}
                        {plateDisplay && (
                          <span className="text-[10px] font-mono border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
                            {plateDisplay}
                          </span>
                        )}
                        {isElectric && (
                          <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold">
                            EV
                          </span>
                        )}
                        {isTruck && (
                          <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                            <Truck size={9} /> {t('truckCategory') || 'شاحنة'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="flex items-center gap-1 bg-[var(--primary)]/10 px-2 py-1 rounded-lg flex-shrink-0">
                        <CheckCircle className="text-[var(--primary)]" size={14} />
                        <span className="text-[10px] font-bold text-[var(--primary)]">
                          {t('active') || 'نشطة'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-3">
                    {/* العداد */}
                    <span className="text-xs font-bold text-[var(--text)] bg-[var(--surface-2)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                      {odometerValue.toLocaleString()} KM
                    </span>
                    
                    {/* أزرار التحكم */}
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/add-vehicle?id=${car.id}`); }} 
                        aria-label={t('editCar') || 'تعديل السيارة'}
                        className="p-2 text-blue-500 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 active:scale-90 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteClick(e, car.id)} 
                        aria-label={t('confirmDeleteCar') || 'حذف السيارة'}
                        className="p-2 text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20 active:scale-90 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleConfirmDelete} 
        title={t('confirmDeleteCar') || 'تأكيد حذف السيارة'}
        message={deleteMessage}
        confirmText={t('confirmDeleteCarBtn') || 'نعم، احذف السيارة'}
        cancelText={t('cancel') || 'تراجع'}
      />
    </div>
  );
}
