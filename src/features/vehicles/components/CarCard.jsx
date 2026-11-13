import { useContext } from 'react';
import { AppContext } from '../../../context/AppContext.jsx';
import { Car, CheckCircle2, MoreVertical } from 'lucide-react';

export default function CarCard({ car, isSelected, onSelect, onMenuClick }) {
  const { t } = useContext(AppContext);

  if (!car) return null;

  return (
    <div 
      onClick={() => onSelect && onSelect(car)}
      className={`relative flex items-center p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md' 
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50'
      }`}
    >
      {/* أيقونة السيارة */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
        isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
      }`}>
        <Car size={28} />
      </div>

      {/* بيانات السيارة */}
      <div className="flex-1 ms-4 overflow-hidden">
        <h3 className="font-bold text-[var(--text)] text-base truncate">
          {car.make} {car.model}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
          <span className="bg-[var(--surface-2)] px-2 py-0.5 rounded-md font-mono">
            {car.year}
          </span>
          <span className="font-mono bg-[var(--surface-2)] px-2 py-0.5 rounded-md tracking-wider" dir="ltr">
            {car.plateNumber || '---'}
          </span>
        </div>
      </div>

      {/* مؤشرات الحالة والخيارات */}
      <div className="flex items-center gap-2 shrink-0 ps-2">
        {isSelected && (
          <CheckCircle2 size={20} className="text-[var(--primary)] animate-scale-in" />
        )}
        
        {onMenuClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // منع تحديد البطاقة عند النقر على زر الخيارات
              onMenuClick(car);
            }}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-full transition-colors"
            aria-label={t('options') || 'خيارات'}
          >
            <MoreVertical size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
