import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function AddVehicle() {
  // 1. إضافة t من الـ Context
  const { currentCar, addNewCar, t } = useContext(AppContext); 
  const navigate = useNavigate(); 
  const [car, setCar] = useState({ make: '', model: '', plate: '', currentOdometer: '' });

  useEffect(() => {
    if (currentCar) {
      navigate('/', { replace: true }); 
    }
  }, [currentCar, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!car.make || !car.model || !car.currentOdometer) {
      // 2. ترجمة رسالة التنبيه
      return alert(t('fillRequiredFields') || 'الرجاء تعبئة الحقول الأساسية');
    }
    
    addNewCar({
      ...car,
      currentOdometer: Number(car.currentOdometer)
    });
  };

  return (
    // 3. استخدام متغيرات الألوان الديناميكية
    <div className="min-h-screen bg-[var(--bg)] p-6 flex flex-col font-sans transition-colors duration-300">
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
          {t('addYourCar') || 'أضف سيارتك'}
        </h2>
        <p className="text-[var(--text-muted)] text-sm">
          {t('addYourCarSubtitle') || 'أدخل بيانات سيارتك الأولى لنبدأ التتبع.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <Input 
          label={t('carMake') || 'الماركة (مثال: تويوتا)'} 
          value={car.make} 
          onChange={(e) => setCar({...car, make: e.target.value})} 
          required 
        />
        <Input 
          label={t('carModel') || 'الموديل (مثال: كورولا)'} 
          value={car.model} 
          onChange={(e) => setCar({...car, model: e.target.value})} 
          required 
        />
        <Input 
          label={t('plateNumber') || 'رقم اللوحة (اختياري)'} 
          value={car.plate} 
          onChange={(e) => setCar({...car, plate: e.target.value})} 
        />
        <Input 
          label={t('currentOdometer') || 'عداد السيارة الحالي (KM)'} 
          type="number" 
          value={car.currentOdometer} 
          onChange={(e) => setCar({...car, currentOdometer: e.target.value})} 
          required 
        />
        
        <div className="mt-10">
          <Button type="submit">{t('saveAndContinue') || 'حفظ ومتابعة'}</Button>
        </div>
      </form>
    </div>
  );
}
