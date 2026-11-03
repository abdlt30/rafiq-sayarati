import { Car, Gauge } from 'lucide-react';

export default function CarCard({ car }) {
  if (!car) return null;

  return (
    <div className="bg-gradient-to-br from-brand-600 to-brand-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10">
        <Car size={80} />
      </div>
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{car.make} {car.model}</h2>
          <p className="text-brand-100 text-xs mt-1">{car.plate}</p>
        </div>
        <div className="bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
          <Gauge size={14} />
          <span className="text-sm font-bold">{(car.currentOdometer || 0).toLocaleString()} KM</span>
        </div>
      </div>
    </div>
  );
}
