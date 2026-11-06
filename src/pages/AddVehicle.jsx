import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Camera, X } from 'lucide-react';

export default function AddVehicle() {
  const { addNewCar, updateCar, vehicles, t } = useContext(AppContext); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);

  const [car, setCar] = useState({ 
    make: '', model: '', plate: '', currentOdometer: '', 
    year: '', color: '', image: '' 
  });

  useEffect(() => {
    if (isEditing && vehicles.length > 0) {
      const carToEdit = vehicles.find(v => String(v.id) === String(editId));
      if (carToEdit) setCar(carToEdit);
    }
  }, [isEditing, editId, vehicles]);

  // دالة ذكية لضغط الصورة قبل حفظها لتجنب امتلاء الذاكرة
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600; // تصغير العرض
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // ضغط الصورة بنسبة 70% بصيغة JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setCar({ ...car, image: compressedBase64 });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!car.make || !car.model || !car.currentOdometer) {
      return alert(t('fillRequiredFields') || 'الرجاء تعبئة الحقول الأساسية');
    }
    
    const carData = { ...car, currentOdometer: Number(car.currentOdometer) };

    if (isEditing) {
      updateCar({ ...carData, id: editId });
      navigate('/vehicles');
    } else {
      addNewCar(carData);
      navigate('/');
    }
  };

  return (
    <div className="min-h-full bg-[var(--bg)] p-6 flex flex-col font-sans transition-colors duration-300 pb-24">
      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
          {isEditing ? (t('editCar') || 'تعديل السيارة') : (t('addYourCar') || 'أضف سيارتك')}
        </h2>
        <p className="text-[var(--text-muted)] text-sm">
          {isEditing ? (t('editCarSubtitle') || 'قم بتحديث بيانات سيارتك.') : (t('addYourCarSubtitle') || 'أدخل بيانات سيارتك لنبدأ التتبع.')}
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32 rounded-3xl bg-[var(--surface-2)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden group hover:border-[var(--primary)] transition-colors shadow-lg">
          {car.image ? (
            <>
              <img src={car.image} alt="Car" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setCar({...car, image: ''})}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
              <Camera size={32} className="mb-2" />
              <span className="text-[10px] font-bold">إضافة صورة</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-1">
        <Input label={t('carMake') || 'الماركة (مثال: تويوتا)'} value={car.make} onChange={(e) => setCar({...car, make: e.target.value})} required />
        <Input label={t('carModel') || 'الموديل (مثال: كورولا)'} value={car.model} onChange={(e) => setCar({...car, model: e.target.value})} required />
        
        <div className="grid grid-cols-2 gap-3">
          <Input label="سنة الصنع (اختياري)" type="number" value={car.year || ''} onChange={(e) => setCar({...car, year: e.target.value})} />
          <Input label="اللون (اختياري)" value={car.color || ''} onChange={(e) => setCar({...car, color: e.target.value})} />
        </div>

        <Input label={t('plateNumber') || 'رقم اللوحة (اختياري)'} value={car.plate} onChange={(e) => setCar({...car, plate: e.target.value})} />
        <Input label={t('currentOdometer') || 'عداد السيارة الحالي (KM)'} type="number" value={car.currentOdometer} onChange={(e) => setCar({...car, currentOdometer: e.target.value})} required />
        
        <div className="mt-8">
          <Button type="submit">{isEditing ? (t('save') || 'حفظ التعديلات') : (t('saveAndContinue') || 'حفظ ومتابعة')}</Button>
        </div>
      </form>
    </div>
  );
}
