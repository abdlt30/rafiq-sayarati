import { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { useNavigate } from 'react-router-dom';
import { FileDown, Printer, TrendingUp, Wallet, Fuel, Wrench, PieChart as PieChartIcon, BarChart3, AlertCircle } from 'lucide-react';
import { safeNumber } from '../shared/utils/safeNumber.js';

// ✅ استيراد مكونات الرسوم البيانية
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const COLORS = ['#3b82f6', '#eab308', '#a855f7']; // أزرق للوقود، أصفر للصيانة، بنفسجي للمصاريف

export default function Reports() {
  const { currentCar, t, currency, lang } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [rawData, setRawData] = useState({ fuel: [], maintenance: [], expenses: [], incomes: [] });
  const [period, setPeriod] = useState('all'); // all | month | year

  // ✅ جلب البيانات الخام (Raw Data) لعمل الرسوم البيانية
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!currentCar) return;
      setIsLoading(true);
      try {
        const carIdStr = String(currentCar.id);
        const allFuel = await dbService.getFuel() || [];
        const allMaint = await dbService.getMaintenance() || [];
        const allExp = await dbService.getExpenses() || [];
        const allInc = await dbService.getIncomes() || [];

        if (isMounted) {
          setRawData({
            fuel: allFuel.filter(r => String(r.carId) === carIdStr),
            maintenance: allMaint.filter(r => String(r.carId) === carIdStr),
            expenses: allExp.filter(r => String(r.carId) === carIdStr),
            incomes: allInc.filter(r => String(r.carId) === carIdStr),
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentCar]);

  // ✅ تصفية البيانات بناءً على الفترة المحددة (هذا الشهر، هذه السنة، الكل)
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filterByDate = (arr) => arr.filter(r => {
      if (period === 'all' || !r.date) return true;
      const d = new Date(r.date);
      if (period === 'month') return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      if (period === 'year') return d.getFullYear() === currentYear;
      return true;
    });

    return {
      fuel: filterByDate(rawData.fuel),
      maintenance: filterByDate(rawData.maintenance),
      expenses: filterByDate(rawData.expenses),
      incomes: filterByDate(rawData.incomes),
    };
  }, [rawData, period]);

  // ✅ الحسابات الرياضية الدقيقة
  const totals = useMemo(() => {
    const fuelCost = filteredData.fuel.reduce((s, r) => s + safeNumber(r.cost), 0);
    const maintCost = filteredData.maintenance.reduce((s, r) => s + safeNumber(r.cost), 0);
    const expCost = filteredData.expenses.reduce((s, r) => s + safeNumber(r.cost), 0);
    const incomeTotal = filteredData.incomes.reduce((s, r) => s + safeNumber(r.amount), 0);

    const totalExpenses = fuelCost + maintCost + expCost;
    const netProfit = incomeTotal - totalExpenses;

    return { fuelCost, maintCost, expCost, incomeTotal, totalExpenses, netProfit };
  }, [filteredData]);

  // ✅ بيانات الرسم الدائري (توزيع المصاريف)
  const pieData = useMemo(() => {
    if (totals.totalExpenses === 0) return [];
    return [
      { name: t('fuelLabel') || 'وقود', value: totals.fuelCost },
      { name: t('maintenanceLabel') || 'صيانة', value: totals.maintCost },
      { name: t('expensesLabel') || 'مصاريف أخرى', value: totals.expCost },
    ].filter(d => d.value > 0); // إخفاء القيم الصفرية
  }, [totals, t]);

  // ✅ بيانات الرسم الشريطي (المصاريف الشهرية - آخر 6 أشهر)
  const barData = useMemo(() => {
    const months = {};
    const now = new Date();
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

    // تجميع البيانات حسب الشهر
    [...filteredData.fuel, ...filteredData.maintenance, ...filteredData.expenses].forEach(r => {
      if (!r.date) return;
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months[key]) {
        months[key] = { 
          name: d.toLocaleDateString(locale, { month: 'short' }), 
          total: 0, 
          timestamp: d.getTime() 
        };
      }
      months[key].total += safeNumber(r.cost);
    });

    // تحويلها لمصفوفة وترتيبها زمنياً
    return Object.values(months).sort((a, b) => a.timestamp - b.timestamp).slice(-6);
  }, [filteredData, lang]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-[var(--surface-2)] rounded-lg w-1/3 mb-6"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-[var(--surface-2)] rounded-2xl"></div>
          <div className="h-20 bg-[var(--surface-2)] rounded-2xl"></div>
          <div className="h-20 bg-[var(--surface-2)] rounded-2xl"></div>
        </div>
        <div className="h-64 bg-[var(--surface-2)] rounded-2xl mt-4"></div>
        <div className="h-64 bg-[var(--surface-2)] rounded-2xl mt-4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reports') || 'التقارير'}</h1>
        <button 
          onClick={() => navigate('/report-print')}
          className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-transform"
        >
          <Printer size={14} /> {t('pdfReport') || 'تقرير PDF'}
        </button>
      </div>

      {/* تصفية الفترة (Tabs) */}
      <div className="flex gap-2 bg-[var(--surface-2)] p-1 rounded-xl">
        {[
          { id: 'all', label: t('allPeriods') || 'الكل' },
          { id: 'year', label: t('thisYear') || 'هذه السنة' },
          { id: 'month', label: t('thisMonth') || 'هذا الشهر' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${period === p.id ? 'bg-[var(--surface)] shadow-sm text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ملخص الإحصائيات (Summary Cards) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] border border-green-500/20 p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalIncome')}</p>
          <p className="text-lg font-extrabold text-green-500 truncate">{totals.incomeTotal.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        <div className="bg-[var(--surface)] border border-red-500/20 p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalExpenses')}</p>
          <p className="text-lg font-extrabold text-red-500 truncate">{totals.totalExpenses.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        <div className={`col-span-2 border p-3 rounded-2xl flex justify-between items-center ${totals.netProfit >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('netProfit')}</p>
            <p className={`text-xl font-extrabold ${totals.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totals.netProfit.toLocaleString()} <span className="text-xs font-normal">{currency}</span>
            </p>
          </div>
          <TrendingUp size={28} className={totals.netProfit >= 0 ? 'text-green-500/20' : 'text-red-500/20'} />
        </div>
      </div>

      {/* 1. الرسم الدائري (توزيع المصاريف) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon size={18} className="text-[var(--primary)]" />
          <h3 className="font-bold text-sm">{t('expenseDistribution')}</h3>
        </div>
        
        {pieData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
            <PieChartIcon size={32} className="opacity-20 mb-2" />
            <p className="text-xs font-bold">{t('noDataForChart')}</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `${value.toLocaleString()} ${currency}`}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. الرسم الشريطي (المصاريف الشهرية) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-[var(--primary)]" />
          <h3 className="font-bold text-sm">{t('monthlyTrend')}</h3>
        </div>

        {barData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
            <BarChart3 size={32} className="opacity-20 mb-2" />
            <p className="text-xs font-bold">{t('noDataForChart')}</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  formatter={(value) => `${value.toLocaleString()} ${currency}`}
                  cursor={{ fill: 'var(--surface-2)' }}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}
