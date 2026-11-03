import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold text-white mb-4">لوحة التحكم</h1>
      <p className="text-slate-400">
        {currentCar ? `مرحباً، ${currentCar.make} ${currentCar.model}` : 'لا توجد سيارة'}
      </p>
    </div>
  );
}
