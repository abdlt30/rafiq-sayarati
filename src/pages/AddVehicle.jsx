import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function AddVehicle() {
  const { addNewCar, updateCar, vehicles, t } = useContext(AppContext); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);

  const [car, setCar] = useState({ make: '', model: '', plate: '', currentOdometer: '' });

  useEffect(() => {
    if (isEditing && vehicles.length > 0) {
      // تحويل الـ ID إلى نص لضمان التطابق التام
      const carToEdit = vehicles.find(v => String(v.id) === String(editId));
      if (carToEdit) {
        setCar({
          make: carToEdit.make || '',
          model: carToEdit.model || '',
          plate: carToEdit.plate || '',
          currentOdometer: carToEdit.currentOdometer || ''
        });
      }
    }
  }, [isEditing, editId, vehicles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!car.make || !car.model || !car.currentOdometer) {
      return alert(t('fillRequiredFields') || 'الرجاء تعبئة الحقول الأساسية');
    }
    
    if (isEditing) {
      updateCar({ ...car, id: editId, currentOdometer: Number(car.currentOdometer) });
      navigate('/vehicles');
    } else {
      addNewCar({ ...car, currentOdometer: Number(car.currentOdometer) });
      navigate('/');
    }
  };

  return (
    <div className="min-h-full bg-[var(--bg)] p-6 flex flex-col font-sans transition-colors duration-300">
      <div className="mt-4 mb-8">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
          {isEditing ? (t('editCar') || 'تعديل السيارة') : (t('addYourCar') || 'أضف سيارتك')}
        </h2>
        <p className="text-[var(--text-muted)] text-sm">
          {isEditing ? (t('editCarSubtitle') || 'قم بتحديث بيانات سيارتك.') : (t('addYourCarSubtitle') || 'أدخل بيانات سيارتك لنبدأ التتبع.')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <Input label={t('carMake') || 'الماركة (مثال: تويوتا)'} value={car.make} onChange={(e) => setCar({...car, make: e.target.value})} required />
        <Input label={t('carModel') || 'الموديل (مثال: كورولا)'} value={car.model} onChange={(e) => setCar({...car, model: e.target.value})} required />
        <Input label={t('plateNumber') || 'رقم اللوحة (اختياري)'} value={car.plate} onChange={(e) => setCar({...car, plate: e.target.value})} />
        <Input label={t('currentOdometer') || 'عداد السيارة الحالي (KM)'} type="number" value={car.currentOdometer} onChange={(e) => setCar({...car, currentOdometer: e.target.value})} required />
        
        <div className="mt-10">
          <Button type="submit">{isEditing ? (t('save') || 'حفظ التعديلات') : (t('saveAndContinue') || 'حفظ ومتابعة')}</Button>
        </div>
      </form>
    </div>
  );
}
