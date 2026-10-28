import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function AddVehicle() {
  const { setCurrentCar } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [car, setCar] = useState({ make: '', model: '', year: '2024', plate: '', odometer: '0' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentCar(car);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6 flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">أضف سيارتك</h2>
      <form onSubmit={handleSubmit}>
        <Input label="الماركة (مثال: تويوتا)" value={car.make} onChange={(e) => setCar({...car, make: e.target.value})} required />
        <Input label="الموديل (مثال: كورولا)" value={car.model} onChange={(e) => setCar({...car, model: e.target.value})} required />
        <Input label="رقم اللوحة" value={car.plate} onChange={(e) => setCar({...car, plate: e.target.value})} required />
        <Input label="عداد السيارة الحالي (KM)" type="number" value={car.odometer} onChange={(e) => setCar({...car, odometer: e.target.value})} required />
        
        <Button type="submit" className="mt-4">حفظ السيارة</Button>
      </form>
    </div>
  );
}
