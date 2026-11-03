import { Gauge } from 'lucide-react';

export default function CarCard({ car }) {
  if (!car) return null;

  return (
    <div className="hero-card mb-6">
      <div className="flex justify-between items-start relative z-10">
        <div className="bg-blue-500/20 px-4 py-2 rounded-xl backdrop-blur-sm flex items-center gap-2">
          <Gauge size={18} className="text-white" />
          <span className="font-bold text-white text-lg">{(car.currentOdometer || 0).toLocaleString()} KM</span>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-white">{car.make} {car.model}</h2>
          <p className="text-blue-200 text-sm mt-1">{car.plate}</p>
        </div>
      </div>
      
      {/* أيقونة السيارة الخفيفة في الخلفية */}
      <div className="absolute -bottom-6 -left-6 opacity-10">
        <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>
          <path d="M3 17v-4l2-6h11l3 6h2v4"/>
          <path d="M5 7h9"/>
        </svg>
      </div>
    </div>
  );
}
