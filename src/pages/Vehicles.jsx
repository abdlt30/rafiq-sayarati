import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Car, Plus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Vehicles() {
  const { currentCar, setCurrentCar, t } = useContext(AppContext);
  const navigate = useNavigate();
  
  // جلب السيارات من الذاكرة
  const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];

  const selectCar = (car) => {
    localStorage.setItem('savedCar', JSON.stringify(car));
    setCurrentCar(car);
    navigate('/'); // العودة للرئيسية
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('vehicles') || 'سياراتي'}</h1>
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
                onClick={() => selectCar(car)}
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
                {isActive && <CheckCircle className="text-[var(--primary)]" size={20} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
