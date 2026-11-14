import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { Camera, X } from 'lucide-react';

import Input from '../shared/components/ui/Input.jsx';
import Button from '../shared/components/ui/Button.jsx';
import OptionPicker from '../shared/components/ui/OptionPicker.jsx';
// ✅ استيراد دالة الحماية الرياضية
import { safeNumber } from '../shared/utils/safeNumber.js';

const EMPTY_CAR = { 
  make: '', model: '', plate: '', odometer: '', 
  year: '', color: '', image: '',
  powertrain: 'ice',
  fuelType: 'petrol',
  batteryCapacity: '',
  category: 'car'
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;       
const MAX_IMAGE_DIM = 800;                     
const MAX_MAKE_LEN = 50;
const MAX_MODEL_LEN = 50;
const MAX_PLATE_LEN = 20;
const MAX_ODO = 10_000_000;                    
const MIN_BATTERY = 5;                         
const MAX_BATTERY = 250;                       
const MIN_YEAR = 1886;                         

export default function AddVehicle() {
  const { addNewCar, updateCar, vehicles, t } = useContext(AppContext); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [car, setCar] = useState(EMPTY_CAR);

  const powertrainOptions = [
    { value: 'ice', label: t('ice') || 'بنزين / ديزل' },
    { value: 'ev', label: t('ev') || 'كهربائية' },
    { value: 'hybrid', label: t('hybrid') || 'هجينة' },
    { value: 'phev', label: t('phev') || 'هجينة قابلة للشحن' }
  ];

  const fuelTypeOptions = [
    { value: 'petrol', label: t('petrol') || 'بنزين' },
    { value: 'diesel', label: t('diesel') || 'ديزل' }
  ];

  const categoryOptions = [
    { value: 'car', label: t('carCategory') || 'سيارة' },
    { value: 'truck', label: t('truckCategory') || 'شاحنة' },
    { value: 'van', label: t('vanCategory') || 'فان' }
  ];

  const needsBattery = car.powertrain === 'ev' || car.powertrain === 'hybrid' || car.powertrain === 'phev';
  const needsFuelType = car.powertrain === 'ice' || car.powertrain === 'hybrid' || car.powertrain === 'phev';

  /* ===================== تحميل بيانات التعديل ===================== */
  useEffect(() => {
    if (!isEditing || vehicles.length === 0) return;
    const carToEdit = vehicles.find(v => String(v.id) === String(editId));
    if (!carToEdit) return;

    setCar({
      make: carToEdit.make || '',
      model: carToEdit.model || '',
      plate: carToEdit.plate || '',
      odometer: carToEdit.odometer != null ? String(carToEdit.odometer) : '',
      year: carToEdit.year != null ? String(carToEdit.year) : '',
      color: carToEdit.color || '',
      image: carToEdit.image || '',
      powertrain: carToEdit.powertrain || 'ice',
      fuelType: carToEdit.fuelType || 'petrol',
      batteryCapacity: carToEdit.batteryCapacity != null ? String(carToEdit.batteryCapacity) : '',
      category: carToEdit.category || 'car'
    });
  }, [isEditing, editId, vehicles]);

  /* ===================== ضغط الصور (Canvas) ===================== */
  const compressImage = (file, maxDim = MAX_IMAGE_DIM) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read_failed'));
      reader.onload = (event) => {
        const img = new Image();
        img.onerror = () => reject(new Error('image_load_failed'));
        img.onload = () => {
          try {
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
              else { w = Math.round((w * maxDim) / h); h = maxDim; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('canvas_context_failed'));
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } catch (err) {
            reject(err);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('invalidFileType') || 'الرجاء اختيار ملف صورة صالح.');
      input.value = null;
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(t('imageTooLarge') || 'حجم الصورة كبير جداً. الحد 5 ميجابايت.');
      input.value = null;
      return;
    }

    try {
      const compressed = await compressImage(file);
      setCar(prev => ({ ...prev, image: compressed }));
      setError(''); 
    } catch (err) {
      console.error('image compress failed:', err);
      setError(t('imageProcessingFailed') || 'تعذر معالجة الصورة.');
    } finally {
      input.value = null;
    }
  };

  /* ===================== التحقق الرياضي (Math Validation) ===================== */
  const validate = () => {
    const make = (car.make || '').trim();
    const model = (car.model || '').trim();
    if (!make || !model) {
      return t('fillRequiredFields') || 'الرجاء تعبئة الحقول الأساسية';
    }

    if (make.length > MAX_MAKE_LEN || model.length > MAX_MODEL_LEN) {
      return t('fieldTooLong') || 'النص طويل جداً.';
    }

    // ✅ استخدام safeNumber لتنظيف المدخلات (مثل إزالة الفواصل)
    const odoNum = safeNumber(car.odometer, -1);
    if (odoNum < 0 || odoNum > MAX_ODO) {
      return t('invalidOdometer') || 'العداد غير صالح.';
    }
    if (!Number.isInteger(odoNum)) {
      return t('invalidOdometer') || 'العداد يجب أن يكون رقماً صحيحاً.';
    }

    const yearRaw = String(car.year ?? '').trim();
    if (yearRaw !== '') {
      const yearNum = Number(yearRaw);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(yearNum) || yearNum < MIN_YEAR || yearNum > currentYear + 1) {
        return t('invalidYear') || 'يرجى إدخال سنة صنع صحيحة.';
      }
    }

    const battRaw = String(car.batteryCapacity ?? '').trim();
    if (needsBattery && battRaw !== '') {
      const battNum = Number(battRaw);
      if (!Number.isFinite(battNum) || battNum < MIN_BATTERY || battNum > MAX_BATTERY) {
        return t('invalidBattery') || 'سعة البطارية غير صالحة.';
      }
    }

    if ((car.plate || '').length > MAX_PLATE_LEN) {
      return t('fieldTooLong') || 'رقم اللوحة طويل جداً.';
    }

    return null;
  };

  /* ===================== الحفظ (Save) ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // ✅ استخدام safeNumber لضمان دقة الأرقام
    const odoNum = safeNumber(car.odometer);
    const yearStr = String(car.year ?? '').trim();
    const yearNum = yearStr !== '' ? Number(yearStr) : null;
    
    const battStr = String(car.batteryCapacity ?? '').trim();
    const battNum = (needsBattery && battStr !== '') ? Number(battStr) : null;

    const carData = {
      make: car.make.trim(),
      model: car.model.trim(),
      plate: (car.plate || '').trim(),
      color: (car.color || '').trim(),
      image: car.image || '',
      odometer: odoNum,
      year: yearNum,
      powertrain: car.powertrain,
      fuelType: needsFuelType ? car.fuelType : 'electric',
      batteryCapacity: needsBattery ? battNum : null,
      category: car.category
    };

    setIsSaving(true);
    try {
      // ✅ إصلاح حرج: التحقق من القيمة المرجعة (true/false) قبل التنقل
      let success = false;
      if (isEditing) {
        success = updateCar(editId, carData);
      } else {
        success = addNewCar(carData);
      }

      if (!success) {
        throw new Error('SAVE_FAILED');
      }

      navigate(isEditing ? '/vehicles' : '/');
    } catch (err) {
      console.error('save failed:', err);
      if (err.message === 'SAVE_FAILED') setError(t('errorSaving') || 'حدث خطأ أثناء الحفظ. قد تكون المساحة ممتلئة.');
      else if (err.code === 'INVALID_ODOMETER') setError(t('invalidOdometer') || 'العداد غير صالح.');
      else setError(t('errorSaving') || 'حدث خطأ غير متوقع.');
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
      </div>

      {error && (
        <div 
          role="alert"
          className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-sm font-bold mb-4 animate-fade-in"
        >
          {error}
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32 rounded-3xl bg-[var(--surface-2)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden group hover:border-[var(--primary)] transition-colors">
          {car.image ? (
            <>
              <img src={car.image} alt="Car" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setCar(prev => ({...prev, image: ''}))} 
                aria-label={t('deleteImage') || 'حذف الصورة'}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full backdrop-blur-sm active:scale-90 transition-transform"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
              <Camera size={32} className="mb-2" aria-hidden="true" />
              <span className="text-[10px] font-bold">{t('addImage') || 'إضافة صورة'}</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" // ✅ فتح الكاميرا مباشرة على الهاتف
                onChange={handleImageUpload} 
                className="hidden" 
                aria-label={t('addImage') || 'إضافة صورة'} 
              />
            </label>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex-1 space-y-1">
        <Input 
          label={t('carMake') || 'الماركة'} 
          value={car.make} 
          onChange={(e) => setCar(prev => ({...prev, make: e.target.value}))} 
          maxLength={MAX_MAKE_LEN}
          required 
        />
        <Input 
          label={t('carModel') || 'الموديل'} 
          value={car.model} 
          onChange={(e) => setCar(prev => ({...prev, model: e.target.value}))} 
          maxLength={MAX_MODEL_LEN}
          required 
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input 
            label={t('carYear') || 'سنة الصنع'} 
            type="number" 
            inputMode="numeric"
            min={MIN_YEAR}
            max={new Date().getFullYear() + 1}
            value={car.year || ''} 
            onChange={(e) => setCar(prev => ({...prev, year: e.target.value}))} 
          />
          <Input 
            label={t('plateNumber') || 'رقم اللوحة'} 
            value={car.plate} 
            onChange={(e) => setCar(prev => ({...prev, plate: e.target.value}))} 
            maxLength={MAX_PLATE_LEN}
          />
        </div>

        <div className="mt-2">
          <OptionPicker 
            label={t('vehicleCategory') || 'فئة السيارة'} 
            options={categoryOptions} 
            value={car.category} 
            onChange={(val) => setCar(prev => ({...prev, category: val}))} 
          />
        </div>

        <div className="mt-2">
          <OptionPicker 
            label={t('powertrain') || 'نوع المحرك'} 
            options={powertrainOptions} 
            value={car.powertrain} 
            onChange={(val) => setCar(prev => ({...prev, powertrain: val}))} 
          />
        </div>

        {needsFuelType && (
          <div className="mt-2 animate-fade-in">
            <OptionPicker 
              label={t('fuelType') || 'نوع الوقود'} 
              options={fuelTypeOptions} 
              value={car.fuelType || 'petrol'} 
              onChange={(val) => setCar(prev => ({...prev, fuelType: val}))} 
            />
          </div>
        )}

        {needsBattery && (
          <div className="mt-2 animate-fade-in">
            <Input 
              label={t('batteryCapacity') || 'سعة البطارية'} 
              type="number" 
              inputMode="decimal"
              step="0.1"
              min={MIN_BATTERY}
              max={MAX_BATTERY}
              value={car.batteryCapacity || ''} 
              onChange={(e) => setCar(prev => ({...prev, batteryCapacity: e.target.value}))} 
            />
          </div>
        )}

        <div className="mt-2">
          <Input 
            label={t('currentOdometer') || 'عداد السيارة الحالي'} 
            type="number" 
            inputMode="numeric"
            min="0"
            step="1"
            value={car.odometer} 
            onChange={(e) => setCar(prev => ({...prev, odometer: e.target.value}))} 
            required 
          />
        </div>
        
        <div className="mt-8">
          <Button type="submit" disabled={isSaving}>
            {isSaving 
              ? (t('saving') || 'جاري الحفظ...') 
              : (isEditing ? (t('save') || 'حفظ') : (t('saveAndContinue') || 'حفظ ومتابعة'))}
          </Button>
        </div>
      </form>
    </div>
  );
}
