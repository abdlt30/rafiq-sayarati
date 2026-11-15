import { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { X, Search, CheckCircle, ChevronDown, Car } from 'lucide-react';

import Input from '../shared/components/ui/Input.jsx';
import Button from '../shared/components/ui/Button.jsx';
import OptionPicker from '../shared/components/ui/OptionPicker.jsx';
import { safeNumber } from '../shared/utils/safeNumber.js';
import { CAR_BRANDS, getBrandLogoUrl } from '../shared/constants/carBrands.js';

const EMPTY_CAR = { 
  make: '', model: '', plate: '', odometer: '', 
  year: '', color: '', image: '',
  powertrain: 'ice',
  fuelType: 'petrol',
  batteryCapacity: '',
  category: 'car'
};

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

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  // ✅ إصلاح البحث: إزالة المسافات وتجاهل حالة الأحرف
  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    if (!query) return CAR_BRANDS;
    return CAR_BRANDS.filter(brand => 
      brand.name.toLowerCase().includes(query)
    );
  }, [brandSearch]);

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

  const validate = () => {
    const make = (car.make || '').trim();
    const model = (car.model || '').trim();
    if (!make || !model) return t('fillRequiredFields') || 'الرجاء تعبئة الحقول الأساسية';
    if (make.length > MAX_MAKE_LEN || model.length > MAX_MODEL_LEN) return t('fieldTooLong') || 'النص طويل جداً.';

    const odoNum = safeNumber(car.odometer, -1);
    if (odoNum < 0 || odoNum > MAX_ODO || !Number.isInteger(odoNum)) return t('invalidOdometer') || 'العداد غير صالح.';

    const yearRaw = String(car.year ?? '').trim();
    if (yearRaw !== '') {
      const yearNum = Number(yearRaw);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(yearNum) || yearNum < MIN_YEAR || yearNum > currentYear + 1) return t('invalidYear') || 'يرجى إدخال سنة صنع صحيحة.';
    }

    const battRaw = String(car.batteryCapacity ?? '').trim();
    if (needsBattery && battRaw !== '') {
      const battNum = Number(battRaw);
      if (!Number.isFinite(battNum) || battNum < MIN_BATTERY || battNum > MAX_BATTERY) return t('invalidBattery') || 'سعة البطارية غير صالحة.';
    }

    if ((car.plate || '').length > MAX_PLATE_LEN) return t('fieldTooLong') || 'رقم اللوحة طويل جداً.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) return setError(validationError);

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
      image: car.image || '', // سيتم تركه فارغاً لأننا أزلنا حقل الصورة
      odometer: odoNum,
      year: yearNum,
      powertrain: car.powertrain,
      fuelType: needsFuelType ? car.fuelType : 'electric',
      batteryCapacity: needsBattery ? battNum : null,
      category: car.category
    };

    setIsSaving(true);
    try {
      let success = isEditing ? updateCar(editId, carData) : addNewCar(carData);
      if (!success) throw new Error('SAVE_FAILED');
      navigate(isEditing ? '/vehicles' : '/');
    } catch (err) {
      if (err.message === 'SAVE_FAILED') setError(t('errorSaving') || 'حدث خطأ أثناء الحفظ.');
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
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-sm font-bold mb-4 animate-fade-in">
          {error}
        </div>
      )}

      {/* ✅ تم حذف قسم رفع الصورة بناءً على طلبك */}

      <form onSubmit={handleSubmit} noValidate className="flex-1 space-y-1">
        
        {/* حقل الماركة */}
        <div className="flex flex-col gap-1.5 mt-2 mb-4">
          <label className="text-xs font-bold text-[var(--text-muted)] mr-1">
            {t('carMake') || 'الماركة'} <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setIsBrandModalOpen(true)}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-3.5 px-4 flex items-center justify-between text-right active:scale-[0.98] transition-all hover:border-[var(--primary)]"
          >
            <span className={`text-sm font-bold ${car.make ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
              {car.make || t('chooseBrand') || 'اختر ماركة السيارة...'}
            </span>
            <ChevronDown size={18} className="text-[var(--text-muted)]" />
          </button>
        </div>

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

      {/* ✅ النافذة السفلية لاختيار الماركة */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-end justify-center backdrop-blur-sm pb-0" onClick={() => setIsBrandModalOpen(false)}>
          <div className="bg-[var(--surface)] w-full max-w-md rounded-t-3xl border-t border-[var(--border)] animate-slide-up flex flex-col h-[85vh]" onClick={e => e.stopPropagation()}>
            
            <div className="p-5 border-b border-[var(--border)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-[var(--text)]">{t('carBrand') || 'ماركة السيارة'}</h3>
                <button onClick={() => setIsBrandModalOpen(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)]">
                  <X size={18} />
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search size={16} className="text-[var(--text-muted)]" />
                </div>
                <input 
                  type="text" 
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={t('searchBrand') || 'ابحث عن ماركة...'}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2.5 pr-10 pl-4 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-3">
              {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {filteredBrands.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setCar(prev => ({ ...prev, make: brand.name }));
                        setIsBrandModalOpen(false);
                        setBrandSearch('');
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                        car.make === brand.name 
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
                          : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      {/* ✅ حل مشكلة الدوائر البيضاء: إضافة خلفية نصية احتياطية */}
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-[var(--border)] relative">
                        <span className="absolute text-[10px] font-black text-gray-300 uppercase">
                          {brand.name.substring(0, 2)}
                        </span>
                        <img 
                          src={getBrandLogoUrl(brand.domain)} 
                          alt={brand.name} 
                          className="w-full h-full object-contain p-1.5 z-10 relative bg-white"
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      </div>
                      <span className={`text-xs font-bold truncate ${car.make === brand.name ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                        {brand.name}
                      </span>
                      {car.make === brand.name && <CheckCircle size={14} className="text-[var(--primary)] ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <p className="text-sm font-bold text-[var(--text-muted)] mb-4">{t('noResults') || 'لم يتم العثور على الماركة.'}</p>
                  <button onClick={() => {
                    setCar(prev => ({ ...prev, make: brandSearch }));
                    setIsBrandModalOpen(false);
                    setBrandSearch('');
                  }} className="text-xs font-bold text-white bg-[var(--primary)] px-4 py-2 rounded-lg">
                    {t('addCustomBrand') || `إضافة "${brandSearch}"`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
