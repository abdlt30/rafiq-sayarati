import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Car, Plus, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ui/ConfirmModal'; // ✅ استدعاء نافذة التأكيد

export default function Vehicles() {
  const { currentCar, vehicles, selectCar, deleteCar, t } = useContext(AppContext);
  const navigate = useNavigate();
  
  // ✅ حالة لحفظ معرف السيارة المراد حذفها
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // منع فتح السيارة عند الضغط على الحذف
    setDeleteId(id); // فتح نافذة التأكيد
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteCar(deleteId);
      setDeleteId(null); // إغلاق النافذة
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-6 relative min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--primary)]/10 rounded-2xl">
            <Car size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text)]">{t('vehicles') || 'سياراتي'}</h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{t('manageFleet') || 'إدارة أسطول سياراتك'}</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/add-vehicle')} 
          className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors text-sm font-bold"
        >
          <Plus size={16} /> {t('add') || 'إضافة'}
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-5 bg-[var(--surface-2)] rounded-full mb-4">
            <Car size={48} className="opacity-30" />
          </div>
          <p className="font-bold">{t('noVehiclesAdded') || 'لا توجد سيارات مضافة.'}</p>
          <button onClick={() => navigate('/add-vehicle')} className="mt-4 text-[var(--primary)] font-bold text-sm bg-[var(--primary)]/10 px-4 py-2 rounded-lg">
            إضافة سيارتك الأولى
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(car => {
            const isActive = currentCar?.id === car.id;
            // ✅ التحقق من وجود العداد بأي من المسميين لتجنب الأخطاء
            const odometerValue = car.currentOdometer || car.odometer || 0;

            return (
              <div 
                key={car.id} 
                onClick={() => { selectCar(car); navigate('/'); }}
                className={`relative p-3.5 rounded-3xl border flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/10 to-transparent shadow-md shadow-blue-500/10' 
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]/50'
                }`}
              >
                {/* صورة السيارة (مصغرة) */}
                <div className={`w-20 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border ${isActive ? 'border-[var(--primary)]/30 bg-[var(--primary)]/10' : 'border-[var(--border)] bg-[var(--surface-2)]'}`}>
                  {car.image ? (
                    <img src={car.image} alt="car" className="w-full h-full object-cover" />
                  ) : (
                    <Car size={28} className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-50'} />
                  )}
                </div>

                {/* بيانات السيارة */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="truncate pr-2">
                      <h3 className="font-bold text-base text-[var(--text)] leading-tight truncate">
                        {car.make} {car.model}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {car.year && <span className="text-[10px] bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">{car.year}</span>}
                        {car.plate && <span className="text-[10px] font-mono border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">{car.plate}</span>}
                      </div>
                    </div>
                    {isActive && <CheckCircle className="text-[var(--primary)] flex-shrink-0" size={18} />}
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    {/* العداد */}
                    <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-1 rounded-md">
                      {Number(odometerValue).toLocaleString()} KM
                    </span>
                    
                    {/* أزرار التحكم */}
                    <div className="flex gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/add-vehicle?id=${car.id}`); }} 
                        className="p-1.5 text-blue-500 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, car.id)} 
                        className="p-1.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ نافذة تأكيد الحذف الاحترافية */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleConfirmDelete} 
        title={t('confirmDeleteCar') || 'تأكيد حذف السيارة'}
        message={t('confirmDeleteCarMsg') || 'هل أنت متأكد من حذف هذه السيارة؟ سيتم حذف جميع السجلات المرتبطة بها نهائياً.'}
      />
    </div>
  );
}
