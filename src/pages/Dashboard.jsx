import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Gauge, Fuel, Wrench, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#2f6bff', '#f59e0b', '#22c55e'];

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totals, setTotals] = useState({ fuel: 0, maintenance: 0, expenses: 0, total: 0 });

  useEffect(() => {
    if (currentCar) setTotals(dbService.getTotals(currentCar.id));
  }, [currentCar]);

  if (!currentCar) return <div className="text-center text-white mt-10">لا توجد سيارة مسجلة.</div>;

  const chartData = [
    { name: 'وقود', value: totals.fuel },
    { name: 'صيانة', value: totals.maintenance },
    { name: 'أخرى', value: totals.expenses },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* بطاقة السيارة */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl p-6 text-white overflow-hidden shadow-lg shadow-blue-900/50">
        <div className="relative z-10 flex justify-between items-center">
          <div className="bg-white/20 px-3 py-1 rounded-xl flex items-center gap-2 backdrop-blur-sm">
            <Gauge size={18} />
            <span className="font-bold">{(currentCar.currentOdometer || 0).toLocaleString()} KM</span>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold">{currentCar.make} {currentCar.model}</h2>
            <p className="text-blue-200 text-sm mt-1">{currentCar.plate}</p>
          </div>
        </div>
        {/* أيقونة السيارة الشفافة (تم إصلاح حجمها) */}
        <Car size={120} className="absolute -bottom-6 -left-6 opacity-10 pointer-events-none" />
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Wallet size={14} /> إجمالي المصاريف</div>
          <div className="text-xl font-bold text-white">{totals.total} <span className="text-sm">MAD</span></div>
        </div>
        <div className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Gauge size={14} /> تكلفة الكيلومتر</div>
          <div className="text-xl font-bold text-white">0.07 <span className="text-sm">MAD</span></div>
        </div>
        <div className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Fuel size={14} /> إجمالي الوقود</div>
          <div className="text-xl font-bold text-white">{totals.fuel} <span className="text-sm">MAD</span></div>
        </div>
        <div className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Wrench size={14} /> الصيانة</div>
          <div className="text-xl font-bold text-white">{totals.maintenance} <span className="text-sm">MAD</span></div>
        </div>
      </div>

      {/* الرسم البياني */}
      <h3 className="text-lg font-bold text-white mt-4">توزيع المصاريف</h3>
      <div className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl h-64 flex items-center justify-center">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <span className="text-slate-400">لا توجد بيانات كافية</span>
        )}
      </div>

      {/* الإجراءات السريعة */}
      <h3 className="text-lg font-bold text-white mt-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/fuel" className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-slate-300">إضافة وقود</span>
          <Fuel size={20} className="text-blue-500" />
        </Link>
        <Link to="/maintenance" className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-slate-300">إضافة صيانة</span>
          <Wrench size={20} className="text-yellow-500" />
        </Link>
        <Link to="/expenses" className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-slate-300">إضافة مصروف</span>
          <Wallet size={20} className="text-green-500" />
        </Link>
        <Link to="/documents" className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex items-center justify-between">
          <span className="text-slate-300">الوثائق</span>
          <FileText size={20} className="text-purple-500" />
        </Link>
      </div>
    </div>
  );
}
