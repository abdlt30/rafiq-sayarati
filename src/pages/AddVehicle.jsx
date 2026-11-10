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

  // ✅ إصلاح 1: توحيد اسم العداد ليكون odometer (مثل باقي التطبيق)
  const [car, setCar] = useState({ 
    make: '', model: '', plate: '', odometer: '', 
    year: '', color: '', image: '' 
  });

  const [isSaving, setIsSaving] = useState(false); // ✅ حماية من النقر المزدوج

  useEffect(() => {
    if (isEditing && vehicles.length > 0) {
      const carToEdit = vehicles.find(v => String(v.id) === String(editId));
      if (carToEdit) {
        // نضمن قراءة العداد سواء كان مسماه القديم أو الجديد
        setCar({
          ...carToEdit,
          odometer: carToEdit.odometer || carToEdit.currentOdometer || ''
        });
      }
    }
  }, [isEditing, editId, vehicles]);

  // ✅ دالة ضغط الصورة (أمنية وممتازة جداً)
  const compressImage = (file, maxWidth = 600, maxHeight = 600) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setCar({ ...car, image: compressedBase64 });
      } catch (error) {
        alert("حدث خطأ أثناء معالجة الصورة. يرجى اختيار صورة أخرى.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!car.make || !car.model || !car.odometer) {
      return alert(t('fillRequiredFields') || 'الرجاء تعبئة الحقول الأساسية');
    }
    
    // تجهيز البيانات وتوحيد اسم العداد
    const carData = { 
      ...car, 
      odometer: Number(car.odometer) 
    };
    delete carData.currentOdometer; // حذف الاسم القديم إن وجد

    setIsSaving(true);
    try {
      if (isEditing) {
        // ✅ إصلاح 2: استدعاء دالة التحديث بالشكل الصحيح (id, data)
        updateCar(editId, carData);
        navigate('/vehicles');
      } else {
        addNewCar(carData);
        navigate('/');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ، قد تكون مساحة التخزين ممتلئة.');
    } finally {
      setIsSaving(false);
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
        <div className="relative w-32 h-32 rounded-3xl bg-[var(--surface-2)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden group hover:border-[var(--primary)] transition-colors">
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
          {/* ✅ إصلاح 3: استخدام الترجمة للحقول */}
          <Input label={t('carYear') || 'سنة الصنع'} type="number" value={car.year || ''} onChange={(e) => setCar({...car, year: e.target.value})} />
          <Input label={t('carColor') || 'اللون'} value={car.color || ''} onChange={(e) => setCar({...car, color: e.target.value})} />
        </div>

        <Input label={t('plateNumber') || 'رقم اللوحة (اختياري)'} value={car.plate} onChange={(e) => setCar({...car, plate: e.target.value})} />
        
        {/* ✅ إصلاح 4: توحيد الاسم إلى odometer */}
        <Input label={t('currentOdometer') || 'عداد السيارة الحالي (KM)'} type="number" value={car.odometer || ''} onChange={(e) => setCar({...car, odometer: e.target.value})} required />
        
        <div className="mt-8">
          {/* ✅ إضافة حالة isSaving لتعطيل الزر أثناء الحفظ */}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : (isEditing ? (t('save') || 'حفظ التعديلات') : (t('saveAndContinue') || 'حفظ ومتابعة'))}
          </Button>
        </div>
      </form>
    </div>
  );
}
