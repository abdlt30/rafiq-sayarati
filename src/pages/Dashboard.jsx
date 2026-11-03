import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import CarCard from '../components/cars/CarCard';
import Card from '../components/ui/Card';
import { dbService } from '../services/dbService';

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalFuel, setTotalFuel] = useState(0);

  // جلب الإحصائيات عند تحميل الصفحة
  useEffect(() => {
    if (currentCar) {
      setTotalExpenses(dbService.getTotalExpenses());
      setTotalFuel(dbService.getTotalFuel());
    }
  }, [currentCar]);

  return (
    <div className="space-y-6 pb-20">
      <CarCard car={currentCar} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-slate-400 text-sm mb-1">إجمالي المصاريف</span>
          <span className="text-2xl font-bold text-white">{totalExpenses.toLocaleString()} <span className="text-sm text-slate-400">MAD</span></span>
        </Card>
        
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-slate-400 text-sm mb-1">إجمالي الوقود</span>
          <span className="text-2xl font-bold text-white">{totalFuel.toLocaleString()} <span className="text-sm text-slate-400">MAD</span></span>
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
