import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function AddVehicle() {
  const { addNewCar, updateCar, vehicles, t } = useContext(AppContext); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  
  // التحقق مما إذا كان الرابط يحتوي على ID (وضع التعديل)
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);

  const [car, setCar] = useState({ make: '', model: '', plate: '', currentOdometer: '' });

  // تعبئة البيانات فقط إذا كنا في وضع التعديل
  useEffect(() => {
    if (isEditing) {
      const carToEdit = vehicles.find(v => v.id === editId);
      if (carToEdit) setCar(carToEdit);
    }
  }, [isEditing, editId, vehicles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!car.make || !car.model || !car.currentOdometer) {
      return alert(t('fillRequiredFields') || 'الرجاء تعبئة الحقول الأساسية');
    }
    
    if (isEditing) {
      // حفظ التعديلات
      updateCar({ ...car, id: editId, currentOdometer: Number(car.currentOdometer) });
      navigate('/vehicles'); // العودة لصفحة السيارات
    } else {
      // إضافة سيارة جديدة
      addNewCar({ ...car, currentOdometer: Number(car.currentOdometer) });
      // إذا كانت هذه أول سيارة، اذهب للوحة التحكم، وإلا اذهب لصفحة السيارات
      if (vehicles.length === 0) navigate('/');
      else navigate('/vehicles');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6 flex flex-col font-sans transition-colors duration-300">
      <div className="mt-8 mb-8">
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
