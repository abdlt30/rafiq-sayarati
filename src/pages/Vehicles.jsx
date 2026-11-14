import { useContext, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Car, Plus, CheckCircle, Edit2, Trash2, Zap, Truck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { safeNumber } from '../shared/utils/safeNumber.js';
import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx';

/* ✅ عداد السيارة الآمن (يدعم الحقل القديم currentOdometer) */
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

/* ✅ أيقونة حسب نوع المحرك */
const getPowertrainIcon = (powertrain) => {
  if (powertrain === 'ev' || powertrain === 'hybrid' || powertrain === 'phev') return Zap;
  return Car;
};

export default function Vehicles() {
  const { currentCar, vehicles, selectCar, deleteCar, t } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  /* ===================== Toast ===================== */
  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  /* ===================== Handlers ===================== */
  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); 
    setDeleteId(id); 
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const ok = deleteCar(deleteId);
      if (ok === false) {
        showToast(t('errorSaving') || 'فشل حذف السيارة. تحقق من المساحة.', 'error');
      } else {
        showToast(t('deleteSuccess') || 'تم حذف السيارة بنجاح.', 'success');
      }
    } catch (err) {
      console.error('delete failed:', err);
      showToast(t('errorSaving') || 'تعذر حذف السيارة.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSelectCar = (car) => {
    const ok = selectCar(car);
    if (ok !== false) navigate('/');
  };

  const handleKeyDown = (e, car) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handleSelectCar(car);
    }
  };

  /* ===================== رسالة تأكيد الحذف ===================== */
  const deleteMessage = useMemo(() => {
    const msg = t('confirmDeleteCarMsg');
    return msg === 'confirmDeleteCarMsg' 
      ? 'هل أنت متأكد من حذف هذه السيارة؟ سيتم حذف جميع السجلات المرتبطة بها نهائياً.'
      : msg;
  }, [t]);

  return (
    <div className="space-y-4 pb-24 px-4 pt-6 relative min-h-screen">
      
      {/* ✅ Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
        </div>
      )}

      {/* الشريط العلوي */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--primary)]/10 rounded-2xl">
            <Car size={24} className="text-[var(--primary)]" aria-hidden="true" />
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
          aria-label={t('add') || 'إضافة'}
          className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all text-sm font-bold"
        >
          <Plus size={18} aria-hidden="true" /> {t('add') || 'إضافة'}
        </button>
      </div>

      {vehicles.length === 0 ? (
        // ✅ تصميم حالة الفراغ المحدث (متطابق مع باقي الصفحات)
        <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <Car size={36} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">{t('noVehiclesAdded') || 'لا توجد سيارات مضافة'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">{t('addFirstCarHint') || 'أضف سيارتك الأولى لتبدأ في تتبع مصاريفك وصياناتك.'}</p>
          <button onClick={() => navigate('/add-vehicle')} className="flex items-center gap-2 text-white bg-[var(--primary)] px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
            <Plus size={18} /> {t('addFirstCar') || 'إضافة سيارتك الأولى'}
          </button>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label={t('vehicles') || 'سياراتي'}>
          {vehicles.map((car, index) => {
            const isActive = car.id != null && String(currentCar?.id) === String(car.id);
            const odometerValue = getOdometer(car);
            
            const make = (car.make || '').trim() || '—';
            const model = (car.model || '').trim() || '';
            const title = `${make} ${model}`.trim() || '—';
            
            const yearNum = Number(car.year);
            const yearDisplay = Number.isFinite(yearNum) && yearNum > 0 ? String(yearNum) : null;
            
            const plateDisplay = (car.plate || '').trim() || null;

            const PowertrainIcon = getPowertrainIcon(car.powertrain);
            const isElectric = car.powertrain === 'ev';
            const isTruck = car.category === 'truck';

            const key = car.id ? String(car.id) : `fallback-${index}-${car.make}-${car.model}`;

            return (
              <div 
                key={key}
                onClick={() => handleSelectCar(car)}
                onKeyDown={(e) => handleKeyDown(e, car)}
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'true' : undefined}
                aria-label={title}
                className={`relative p-4 rounded-3xl border flex items-center gap-4 cursor-pointer transition-all duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isActive 
                    ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/10 to-transparent shadow-md shadow-blue-500/10' 
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]/50'
                }`}
              >
                {/* صورة السيارة */}
                <div className={`w-20 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border ${
                  isActive 
                    ? 'border-[var(--primary)]/30 bg-[var(--primary)]/10' 
                    : 'border-[var(--border)] bg-[var(--surface-2)]'
                }`}>
                  {car.image ? (
                    <img 
                      src={car.image} 
                      alt={`${title}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <PowertrainIcon 
                      size={28} 
                      className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-50'} 
                      aria-hidden="true"
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
                            <Truck size={9} aria-hidden="true" /> {t('truckCategory') || 'شاحنة'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="flex items-center gap-1 bg-[var(--primary)]/10 px-2 py-1 rounded-lg flex-shrink-0">
                        <CheckCircle className="text-[var(--primary)]" size={14} aria-hidden="true" />
                        <span className="text-[10px] font-bold text-[var(--primary)]">
                          {t('active') || 'نشطة'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-3">
                    {/* العداد */}
                    <span className="text-xs font-bold text-[var(--text)] bg-[var(--surface-2)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                      {odometerValue.toLocaleString()} {t('km') || 'كم'}
                    </span>
                    
                    {/* أزرار التحكم */}
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/add-vehicle?id=${car.id}`); }} 
                        aria-label={t('editCar') || 'تعديل السيارة'}
                        className="p-2 text-blue-500 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 active:scale-90 transition-all"
                      >
                        <Edit2 size={16} aria-hidden="true" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteClick(e, car.id)} 
                        aria-label={t('deleteCar') || t('confirmDeleteCar') || 'حذف السيارة'}
                        className="p-2 text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20 active:scale-90 transition-all"
                      >
                        <Trash2 size={16} aria-hidden="true" />
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
        variant="danger"
        confirmText={t('confirmDeleteCarBtn') || t('confirmDeleteBtn') || 'حذف'}
        cancelText={t('cancel') || 'إلغاء'}
      />
    </div>
  );
}
