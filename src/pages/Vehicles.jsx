import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Car, Plus, CheckCircle, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Vehicles() {
  const { currentCar, vehicles, selectCar, t } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-24 px-4 pt-6 relative min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--primary)]/10 rounded-2xl">
            <Car size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text)]">{t('vehicles') || 'سياراتي'}</h1>
            <p className="text-xs text-[var(--text-muted)]">إدارة أسطول سياراتك</p>
          </div>
        </div>
        
        {/* زر الإضافة في الهيدر */}
        <button 
          onClick={() => navigate('/add-vehicle')} 
          className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-3 py-2 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors text-sm font-bold"
        >
          <Plus size={16} /> إضافة
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <Car size={64} className="mb-4 opacity-20" />
          <p>{t('noVehiclesAdded') || 'لا توجد سيارات مضافة.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map(car => {
            const isActive = currentCar?.id === car.id;
            return (
              <div 
                key={car.id} 
                onClick={() => { selectCar(car); navigate('/'); }}
                className={`relative p-4 rounded-3xl border flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/10 to-transparent shadow-lg shadow-blue-500/10' 
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]'
                }`}
              >
                {/* صورة السيارة */}
                <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden ${isActive ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                  {car.image ? (
                    <img src={car.image} alt="car" className="w-full h-full object-cover" />
                  ) : (
                    <Car size={32} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-[var(--text)] leading-tight">{car.make} {car.model}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5 flex-wrap">
                        {car.year && <span className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded">{car.year}</span>}
                        {car.color && <span className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded">{car.color}</span>}
                        {car.plate && <span>{car.plate}</span>}
                      </p>
                    </div>
                    {isActive && <CheckCircle className="text-[var(--primary)]" size={20} />}
                  </div>
                  
                  <div className="flex justify-between items-end mt-3">
                    <span className="text-sm font-bold bg-[var(--surface-2)] px-2.5 py-1 rounded-lg text-[var(--text)]">{car.currentOdometer} KM</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/add-vehicle?id=${car.id}`); }} 
                      className="p-2 text-[var(--primary)] bg-[var(--primary)]/10 rounded-xl hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
