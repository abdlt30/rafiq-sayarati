import { Car, Gauge } from 'lucide-react';

export default function CarCard({ car }) {
  // حماية: إذا لم تكن هناك سيارة، لا تعرض شيئاً
  if (!car) return null;

  return (
    <div className="bg-gradient-to-br from-brand-600 to-brand-500 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10">
        <Car size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{car.make || 'سيارة'} {car.model || ''}</h2>
            <p className="text-brand-100 text-sm mt-1">{car.plate || 'بدون لوحة'}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <Car size={24} />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/20 w-fit px-4 py-2 rounded-xl backdrop-blur-sm">
          <Gauge size={18} className="text-brand-100" />
          <span className="font-bold tracking-wider">
            {(car.currentOdometer || 0).toLocaleString()} KM
          </span>
        </div>
      </div>
    </div>
  );
}
