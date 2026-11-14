import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ المسار الصحيح للسياق (Context) من مجلد features
import { AppContext } from '../../../context/AppContext.jsx';
import { ChevronDown, Car as CarIcon, Plus } from 'lucide-react';

// ✅ استيراد المكونات المشتركة
import Modal from '../../../shared/components/ui/Modal.jsx';
import Button from '../../../shared/components/ui/Button.jsx';
import CarCard from './CarCard.jsx';

export default function CarSelector() {
  // ✅ إصلاح حرج: استخدام أسماء المتغيرات الصحيحة من AppContext (vehicles و selectCar)
  const { t, vehicles, currentCar, selectCar } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // دالة اختيار السيارة وإغلاق النافذة
  const handleSelectCar = (car) => {
    selectCar(car); // ✅ استخدام الدالة الصحيحة لحفظ وتحديث السيارة
    setIsOpen(false);
  };

  // حالة عدم وجود سيارات (لأول استخدام)
  if (!vehicles || vehicles.length === 0) {
    return (
      <Button 
        variant="outline" 
        onClick={() => navigate('/add-vehicle')}
        className="w-auto px-4 py-2 text-xs"
      >
        <Plus size={16} className="me-1" />
        {t('addVehicle') || 'إضافة سيارة'}
      </Button>
    );
  }

  return (
    <>
      {/* الزر الذي يعرض السيارة الحالية */}
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex items-center gap-2 bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 transition-colors active:scale-95"
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
          <CarIcon size={18} />
        </div>
        <div className="text-start">
          <p className="text-xs text-[var(--text-muted)] font-medium leading-none mb-1">
            {t('currentCar') || 'السيارة الحالية'}
          </p>
          <p className="text-sm font-bold text-[var(--text)] leading-none truncate max-w-[120px]">
            {currentCar ? `${currentCar.make} ${currentCar.model}` : (t('selectCar') || 'اختر سيارة')}
          </p>
        </div>
        <ChevronDown size={16} className="text-[var(--text-muted)] ms-1" />
      </button>

      {/* نافذة اختيار السيارة (Modal) */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={t('selectCar') || 'اختر السيارة'}
      >
        <div className="space-y-3 mt-2">
          {/* ✅ إصلاح حرج: استخدام vehicles بدلاً من cars */}
          {vehicles.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              isSelected={String(currentCar?.id) === String(car.id)} // ✅ تحويل لنص لضمان تطابق آمن
              onSelect={() => handleSelectCar(car)}
            />
          ))}

          {/* زر إضافة سيارة جديدة داخل النافذة */}
          <Button 
            variant="ghost" 
            onClick={() => {
              setIsOpen(false);
              navigate('/add-vehicle');
            }}
            className="mt-4 border-dashed border-2 hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <Plus size={18} className="me-2" />
            {t('addNewVehicle') || 'إضافة سيارة جديدة'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
