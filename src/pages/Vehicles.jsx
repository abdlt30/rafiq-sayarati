import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Car, Plus, CheckCircle, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Vehicles() {
  const { currentCar, vehicles, selectCar, t } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-24 px-4 pt-4 relative min-h-screen">
      
      {/* شعار وهيدر احترافي */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">{t('vehicles') || 'سياراتي'}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">إدارة أسطولك الخاص</p>
        </div>
        <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
          <Car size={28} className="text-[var(--primary)]" />
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <Car size={64} className="mb-4 opacity-20" />
          <p>{t('noVehiclesAdded') || 'لا توجد سيارات مضافة. اضغط على زر (+) لإضافة سيارة.'}</p>
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
                {/* صورة السيارة أو أيقونة افتراضية */}
                <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden ${isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
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
                      <p className="text-xs text-[var(--text-muted)] mt-1">{car.year ? `${car.year} • ` : ''}{car.color ? `${car.color} • ` : ''}{car.plate || 'بدون لوحة'}</p>
                    </div>
                    {isActive && <CheckCircle className="text-[var(--primary)]" size={20} />}
                  </div>
                  
                  <div className="flex justify-between items-end mt-3">
                    <span className="text-sm font-bold bg-[var(--surface-2)] px-2 py-1 rounded-lg text-[var(--text)]">{car.currentOdometer} KM</span>
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

      {/* الزر العائم (Floating Action Button) - أسفل اليسار */}
      <button 
        onClick={() => navigate('/add-vehicle')} 
        className="fixed bottom-24 left-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 hover:bg-blue-600 transition-all z-50"
        aria-label="Add Vehicle"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
