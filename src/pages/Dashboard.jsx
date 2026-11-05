import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Gauge, Fuel, Wrench, Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#2f6bff', '#f59e0b', '#22c55e'];

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totals, setTotals] = useState({ fuel: 0, maintenance: 0, expenses: 0, total: 0 });

  useEffect(() => {
    if (currentCar) setTotals(dbService.getTotals(currentCar.id));
  }, [currentCar]);

  if (!currentCar) return <div className="text-center p-10 text-[var(--text-muted)]">لا توجد سيارة مسجلة.</div>;

  const chartData = [
    { name: 'وقود', value: totals.fuel },
    { name: 'صيانة', value: totals.maintenance },
    { name: 'أخرى', value: totals.expenses },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl p-6 text-white overflow-hidden shadow-xl">
        <Car size={140} className="absolute -bottom-6 -left-6 opacity-10 pointer-events-none" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{currentCar.make} {currentCar.model}</h2>
            <p className="text-blue-200 text-sm mt-1">{currentCar.plate}</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md">
            <Gauge size={18} />
            <span className="font-bold">{(currentCar.currentOdometer || 0).toLocaleString()} KM</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2"><Wallet size={14} /> إجمالي المصاريف</div>
          <div className="text-xl font-bold">{totals.total} <span className="text-sm">MAD</span></div>
        </div>
        {/* أضف باقي البطاقات هنا بنفس النمط */}
      </div>

      {/* Chart */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl" style={{ height: '300px' }}>
        <h3 className="font-bold mb-4">توزيع المصاريف</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)]">لا توجد بيانات</div>
        )}
      </div>
    </div>
  );
}
