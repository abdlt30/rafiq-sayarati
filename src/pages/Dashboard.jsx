import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Gauge, Fuel, Wrench, FileText, Car } from 'lucide-react';
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* بطاقة السيارة */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl p-6 text-white overflow-hidden shadow-lg shadow-blue-900/50">
        <div className="relative z-10 flex justify-between items-center flex-wrap gap-4">
          <div className="bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md">
            <Gauge size={20} />
            <span className="font-bold text-lg">{(currentCar.currentOdometer || 0).toLocaleString()} KM</span>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{currentCar.make} {currentCar.model}</h2>
            <p className="text-blue-200 text-sm mt-1">{currentCar.plate}</p>
          </div>
        </div>
        <Car size={140} className="absolute -bottom-8 -left-8 opacity-10 pointer-events-none" />
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs"><Wallet size={14} /> إجمالي المصاريف</div>
          <div className="text-xl font-bold text-[var(--text)]">{totals.total} <span className="text-sm">MAD</span></div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs"><Gauge size={14} /> تكلفة الكيلومتر</div>
          <div className="text-xl font-bold text-[var(--text)]">0.07 <span className="text-sm">MAD</span></div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs"><Fuel size={14} /> إجمالي الوقود</div>
          <div className="text-xl font-bold text-[var(--text)]">{totals.fuel} <span className="text-sm">MAD</span></div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs"><Wrench size={14} /> الصيانة</div>
          <div className="text-xl font-bold text-[var(--text)]">{totals.maintenance} <span className="text-sm">MAD</span></div>
        </div>
      </div>

      {/* الرسم البياني - تم إصلاح الأبعاد */}
      <h3 className="text-lg font-bold text-[var(--text)] mt-6">توزيع المصاريف</h3>
      <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex items-center justify-center" style={{ height: '300px' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <span className="text-[var(--text-muted)]">لا توجد بيانات كافية</span>
        )}
      </div>

      {/* الإجراءات السريعة */}
      <h3 className="text-lg font-bold text-[var(--text)] mt-6">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/fuel" className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-[var(--text-muted)]">إضافة وقود</span>
          <Fuel size={20} className="text-[var(--primary)]" />
        </Link>
        <Link to="/maintenance" className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-[var(--text-muted)]">إضافة صيانة</span>
          <Wrench size={20} className="text-yellow-500" />
        </Link>
      </div>
    </div>
  );
}
