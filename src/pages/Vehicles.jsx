import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Car, Plus, CheckCircle, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Vehicles() {
  const { currentCar, vehicles, selectCar, t } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-24">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('vehicles')}</h1>
        <button onClick={() => navigate('/add-vehicle')} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg">
          <Plus size={24} />
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-10">
          لا توجد سيارات مضافة. اضغط على زر (+) لإضافة سيارة.
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(car => {
            const isActive = currentCar?.id === car.id;
            return (
              <div 
                key={car.id} 
                onClick={() => { selectCar(car); navigate('/'); }}
                className={`p-4 rounded-2xl border flex justify-between items-center cursor-pointer transition-all ${
                  isActive ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text)]">{car.make} {car.model}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{car.plate} • {car.currentOdometer} KM</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={(e) => { e.stopPropagation(); navigate(`/add-vehicle?id=${car.id}`); }} className="p-2 text-blue-400 bg-blue-400/10 rounded-lg">
                     <Edit2 size={16} />
                   </button>
                   {isActive && <CheckCircle className="text-[var(--primary)]" size={20} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
