import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import CarCard from '../components/cars/CarCard';
import Card from '../components/ui/Card';

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totals, setTotals] = useState({ all: 0, fuel: 0, maintenance: 0, expenses: 0 });

  useEffect(() => {
    if (currentCar) {
      setTotals({
        all: dbService.getTotalAllExpenses(),
        fuel: dbService.getTotalFuel(),
        maintenance: dbService.getTotalMaintenance(),
        expenses: dbService.getTotalExpenses()
      });
    }
  }, [currentCar]);

  if (!currentCar) {
    return <div className="text-center text-white mt-10">لا توجد سيارة مسجلة.</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <CarCard car={currentCar} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-slate-400 text-sm mb-1">إجمالي المصاريف</span>
          <span className="text-2xl font-bold text-white">{totals.all} <span className="text-sm text-slate-400">MAD</span></span>
        </Card>
        
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-slate-400 text-sm mb-1">تكلفة الكيلومتر</span>
          <span className="text-2xl font-bold text-white">0.05 <span className="text-sm text-slate-400">MAD</span></span>
        </Card>
      </div>

      <h3 className="text-white font-bold text-lg mt-4">توزيع المصاريف</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-dark-800 p-3 rounded-xl text-center border border-dark-700">
          <span className="text-slate-400 text-xs">وقود</span>
          <p className="text-white font-bold mt-1">{totals.fuel}</p>
        </div>
        <div className="bg-dark-800 p-3 rounded-xl text-center border border-dark-700">
          <span className="text-slate-400 text-xs">صيانة</span>
          <p className="text-white font-bold mt-1">{totals.maintenance}</p>
        </div>
        <div className="bg-dark-800 p-3 rounded-xl text-center border border-dark-700">
          <span className="text-slate-400 text-xs">أخرى</span>
          <p className="text-white font-bold mt-1">{totals.expenses}</p>
        </div>
      </div>

      <h3 className="text-white font-bold text-lg mt-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">إضافة وقود</span>
          <span className="text-brand-500 bg-brand-500/10 p-2 rounded-lg">⛽</span>
        </button>
        <button className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">إضافة صيانة</span>
          <span className="text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">🔧</span>
        </button>
      </div>
    </div>
  );
}
