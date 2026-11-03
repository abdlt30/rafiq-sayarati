import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import CarCard from '../components/cars/CarCard';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Gauge, Route, TrendingUp, Fuel, Wrench, FileText, Bell } from 'lucide-react';

const COLORS = ['#2f6bff', '#f59e0b', '#22c55e', '#a78bfa', '#64748b'];

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totals, setTotals] = useState({ fuel: 0, maintenance: 0, expenses: 0, total: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (currentCar) {
      setTotals(dbService.getTotals(currentCar.id));
      const allExpenses = [
        ...dbService.getFuel().map(r => ({...r, type: 'fuel'})),
        ...dbService.getMaintenance().map(r => ({...r, type: 'maintenance'})),
        ...dbService.getExpenses().map(r => ({...r, type: 'expense'}))
      ].sort((a, b) => b.id - a.id).slice(0, 4);
      setRecent(allExpenses);
    }
  }, [currentCar]);

  if (!currentCar) return null;

  const chartData = [
    { name: 'وقود', value: totals.fuel },
    { name: 'صيانة', value: totals.maintenance },
    { name: 'أخرى', value: totals.expenses },
  ].filter(item => item.value > 0);

  // حساب تكلفة الكيلومتر (تقريبي)
  const costPerKm = currentCar.currentOdometer > 0 ? (totals.total / currentCar.currentOdometer).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 pb-24">
      <CarCard car={currentCar} />

      {/* شبكة الإحصائيات */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Wallet size={14}/> إجمالي المصاريف</div>
          <span className="text-xl font-bold text-white">{totals.total} <span className="text-xs text-slate-400">MAD</span></span>
        </div>
        <div className="card flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><TrendingUp size={14}/> تكلفة الكيلومتر</div>
          <span className="text-xl font-bold text-white">{costPerKm} <span className="text-xs text-slate-400">MAD</span></span>
        </div>
        <div className="card flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Fuel size={14}/> إجمالي الوقود</div>
          <span className="text-xl font-bold text-white">{totals.fuel} <span className="text-xs text-slate-400">MAD</span></span>
        </div>
        <div className="card flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Wrench size={14}/> الصيانة</div>
          <span className="text-xl font-bold text-white">{totals.maintenance} <span className="text-xs text-slate-400">MAD</span></span>
        </div>
      </div>

      {/* الرسم البياني */}
      <h3 className="text-white font-bold text-lg mt-2">توزيع المصاريف</h3>
      <div className="card p-4 flex items-center justify-between h-56">
        {chartData.length > 0 ? (
          <>
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-3">
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
      </div>

      {/* الإجراءات السريعة */}
      <h3 className="text-white font-bold text-lg mt-2">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/fuel" className="card flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">إضافة وقود</span>
          <span className="text-blue-500 bg-blue-500/10 p-2 rounded-lg"><Fuel size={20}/></span>
        </Link>
        <Link to="/maintenance" className="card flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">إضافة صيانة</span>
          <span className="text-yellow-500 bg-yellow-500/10 p-2 rounded-lg"><Wrench size={20}/></span>
        </Link>
        <Link to="/expenses" className="card flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">إضافة مصروف</span>
          <span className="text-green-500 bg-green-500/10 p-2 rounded-lg"><Wallet size={20}/></span>
        </Link>
        <Link to="/documents" className="card flex items-center justify-between hover:bg-dark-700 transition-colors">
          <span className="text-slate-300">الوثائق</span>
          <span className="text-purple-500 bg-purple-500/10 p-2 rounded-lg"><FileText size={20}/></span>
        </Link>
      </div>
    </div>
  );
}
