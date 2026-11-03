import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { calculateCostPerKm } from '../utils/calculations';
import CarCard from '../components/cars/CarCard';
import Card from '../components/ui/Card';

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totals, setTotals] = useState({ all: 0, fuel: 0, maintenance: 0, expenses: 0 });
  const [costPerKm, setCostPerKm] = useState(0);

  useEffect(() => {
    if (currentCar) {
      const all = dbService.getTotalAllExpenses();
      const fuel = dbService.getTotalFuel();
      const maintenance = dbService.getTotalMaintenance();
      const expenses = dbService.getTotalExpenses();

      setTotals({ all, fuel, maintenance, expenses });

      // حساب تكلفة الكيلومتر
      const initialOdometer = currentCar.initialOdometer || 0;
      const currentOdometer = currentCar.currentOdometer || 0;
      const kmCost = calculateCostPerKm(all, initialOdometer, currentOdometer);
      setCostPerKm(kmCost);
    }
  }, [currentCar]);

  if (!currentCar) return <div className="text-center text-white mt-10">لا توجد سيارة مسجلة.</div>;

  return (
    <div className="space-y-6 pb-20">
      <CarCard car={currentCar} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col justify-between h-28">
          <span className="text-slate-400 text-xs">إجمالي المصاريف</span>
          <span className="text-2xl font-bold text-white">{totals.all} <span className="text-xs text-slate-400">MAD</span></span>
        </Card>
        
        <Card className="p-4 flex flex-col justify-between h-28">
          <span className="text-slate-400 text-xs">تكلفة الكيلومتر</span>
          <span className="text-2xl font-bold text-white">{costPerKm} <span className="text-xs text-slate-400">MAD</span></span>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-28 col-span-2">
          <span className="text-slate-400 text-xs mb-2">توزيع المصاريف</span>
          <div className="flex justify-between items-end">
            <div className="text-center">
              <span className="text-xs text-slate-500 block">وقود</span>
              <span className="text-white font-bold">{totals.fuel}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 block">صيانة</span>
              <span className="text-white font-bold">{totals.maintenance}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 block">أخرى</span>
              <span className="text-white font-bold">{totals.expenses}</span>
            </div>
          </div>
        </Card>
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
