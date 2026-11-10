import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

export default function Reports() {
  const { currentCar, currency, t } = useContext(AppContext);

  // 1. حساب الإجماليات
  const totals = useMemo(() => {
    if (!currentCar) return { fuel: 0, maintenance: 0, expenses: 0, total: 0 };
    return dbService.getTotals(currentCar.id);
  }, [currentCar]);

  // 2. تجميع بيانات المصاريف الشهرية (للمخطط الشريطي)
  const monthlyData = useMemo(() => {
    if (!currentCar) return [];
    
    const fuel = dbService.getFuel().filter(r => r.carId === currentCar.id);
    const maintenance = dbService.getMaintenance().filter(r => r.carId === currentCar.id);
    const expenses = dbService.getExpenses().filter(r => r.carId === currentCar.id);
    const allRecords = [...fuel, ...maintenance, ...expenses];

    // تجميع المصاريف حسب الشهر
    const monthsMap = {};
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    allRecords.forEach(record => {
      if (!record.date) return;
      const date = new Date(record.date);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${monthIndex}`;

      if (!monthsMap[key]) {
        monthsMap[key] = {
          name: `${monthNames[monthIndex]} ${year}`,
          total: 0,
          timestamp: date.getTime()
        };
      }
      monthsMap[key].total += Number(record.cost) || 0;
    });

    // تحويل الكائن إلى مصفوفة وترتيبها حسب التاريخ
    return Object.values(monthsMap).sort((a, b) => a.timestamp - b.timestamp).slice(-6); // آخر 6 أشهر
  }, [currentCar]);

  // بيانات الدائرة (Pie Chart)
  const pieData = [
    { name: t('fuel') || 'الوقود', value: totals.fuel, color: '#3b82f6' }, // أزرق
    { name: t('maintenance') || 'الصيانة', value: totals.maintenance, color: '#f59e0b' }, // أصفر
    { name: t('expenses') || 'المصاريف', value: totals.expenses, color: '#a855f7' }, // بنفسجي
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reports') || 'التقارير'}</h1>
      </div>

      {/* بطاقات الإجمالي */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <p className="text-xs text-[var(--text-muted)] mb-1">{t('totalExpenses') || 'إجمالي المصاريف'}</p>
          <p className="text-xl font-extrabold text-[var(--text)]">{totals.total.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <p className="text-xs text-[var(--text-muted)] mb-1">{t('totalFuelCost') || 'إجمالي الوقود'}</p>
          <p className="text-xl font-extrabold text-blue-500">{totals.fuel.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
      </div>

      {/* المخطط الدائري */}
      {totals.total > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="text-[var(--primary)]" size={20} />
            <h2 className="font-bold text-[var(--text)]">{t('expenseDistribution') || 'توزيع المصاريف'}</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `${value.toLocaleString()} ${currency}`} contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[var(--text-muted)]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* المخطط الشريطي (المصاريف الشهرية) - ✅ تم إصلاحه */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-green-500" size={20} />
          <h2 className="font-bold text-[var(--text)]">{t('monthlyExpenses') || 'المصاريف الشهرية'}</h2>
        </div>
        
        {monthlyData.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] py-10">لا توجد بيانات كافية لعرض المخطط.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <RechartsTooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }} formatter={(value) => `${value.toLocaleString()} ${currency}`} />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
