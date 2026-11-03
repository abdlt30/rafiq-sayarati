import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import CarCard from '../components/cars/CarCard';
import Card from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981']; // أزرق، أصفر، أخضر

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totals, setTotals] = useState({ all: 0, fuel: 0, maintenance: 0, expenses: 0 });

  useEffect(() => {
    if (currentCar) {
      // جلب الإجماليات دفعة واحدة
      const data = dbService.getTotals(currentCar.id);
      setTotals(data);
    }
  }, [currentCar]);

  if (!currentCar) return <div className="text-center text-white mt-10">لا توجد سيارة مسجلة.</div>;

  // تجهيز بيانات الرسم البياني
  const chartData = [
    { name: 'وقود', value: totals.fuel },
    { name: 'صيانة', value: totals.maintenance },
    { name: 'أخرى', value: totals.expenses },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 pb-20">
      <CarCard car={currentCar} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col justify-between h-24">
          <span className="text-slate-400 text-xs">إجمالي المصاريف</span>
          <span className="text-xl font-bold text-white">{totals.all} <span className="text-xs text-slate-400">MAD</span></span>
        </Card>
        
        <Card className="p-4 flex flex-col justify-between h-24">
          <span className="text-slate-400 text-xs">تكلفة الكيلومتر</span>
          {/* ملاحظة: سنقوم بتفعيل الحساب الدقيق في خطوة لاحقة */}
          <span className="text-xl font-bold text-white">0.07 <span className="text-xs text-slate-400">MAD</span></span>
        </Card>
      </div>

      <h3 className="text-white font-bold text-lg mt-4">توزيع المصاريف</h3>
      <Card className="p-4 flex items-center justify-between h-48">
        {chartData.length > 0 ? (
          <>
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-white font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center w-full text-slate-400">لا توجد بيانات لعرضها</div>
        )}
      </Card>

      <h3 className="text-white font-bold text-lg mt-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/fuel" className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">إضافة وقود</span>
          <span className="text-brand-500 bg-brand-500/10 p-2 rounded-lg">⛽</span>
        </Link>
        <Link to="/maintenance" className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">إضافة صيانة</span>
          <span className="text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">🔧</span>
        </Link>
      </div>
    </div>
  );
}
