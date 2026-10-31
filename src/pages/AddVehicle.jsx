import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function AddVehicle() {
  const { addNewCar } = useContext(AppContext);
  const [car, setCar] = useState({ make: '', model: '', plate: '', currentOdometer: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!car.make || !car.model || !car.currentOdometer) {
      return alert('الرجاء تعبئة الحقول الأساسية');
    }
    // الحفظ يتم فوراً وبدون await
    addNewCar({
      ...car,
      currentOdometer: Number(car.currentOdometer)
    });
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6 flex flex-col font-sans">
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">أضف سيارتك</h2>
        <p className="text-slate-400 text-sm">أدخل بيانات سيارتك الأولى لنبدأ التتبع.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        <Input label="الماركة (مثال: تويوتا)" value={car.make} onChange={(e) => setCar({...car, make: e.target.value})} required />
        <Input label="الموديل (مثال: كورولا)" value={car.model} onChange={(e) => setCar({...car, model: e.target.value})} required />
        <Input label="رقم اللوحة (اختياري)" value={car.plate} onChange={(e) => setCar({...car, plate: e.target.value})} />
        <Input label="عداد السيارة الحالي (KM)" type="number" value={car.currentOdometer} onChange={(e) => setCar({...car, currentOdometer: e.target.value})} required />
        
        <div className="mt-10">
          <Button type="submit">حفظ ومتابعة</Button>
        </div>
      </form>
    </div>
  );
}
