import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, BarChart3, Printer } from 'lucide-react';

/* ✅ مساعد رياضي: يرفض NaN, Infinity, -Infinity */
const safeNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const EMPTY_TOTALS = { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0 };

export default function Reports() {
  const { currentCar, currency, t, lang, dataVersion } = useContext(AppContext);
  const navigate = useNavigate();

  /* ===================== 1. الإجماليات ===================== */
  const totals = useMemo(() => {
    if (!currentCar) return { ...EMPTY_TOTALS };
    try {
      const raw = dbService.getTotals(currentCar.id) || {};
      return {
        fuel: safeNumber(raw.fuel),
        maintenance: safeNumber(raw.maintenance),
        expenses: safeNumber(raw.expenses),
        total: safeNumber(raw.total),
        income: safeNumber(raw.income),
        net: safeNumber(raw.net),
      };
    } catch (e) {
      console.error('getTotals failed:', e);
      return { ...EMPTY_TOTALS };
    }
  }, [currentCar, dataVersion]);

  /* ===================== 2. البيانات الشهرية ===================== */
  const monthlyData = useMemo(() => {
    if (!currentCar) return [];

    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    const formatter = new Intl.DateTimeFormat(localeMap[lang] || 'ar-MA', {
      month: 'short',
      year: 'numeric'
    });

    try {
      const carIdStr = String(currentCar.id);
      const fuel = (dbService.getFuel() || []).filter(r => String(r.carId) === carIdStr);
      const maintenance = (dbService.getMaintenance() || []).filter(r => String(r.carId) === carIdStr);
      const expenses = (dbService.getExpenses() || []).filter(r => String(r.carId) === carIdStr);
      const allRecords = [...fuel, ...maintenance, ...expenses];

      const monthsMap = {};

      allRecords.forEach(record => {
        if (!record.date) return;

        const dateStr = String(record.date).includes('T')
          ? record.date
          : `${record.date}T00:00:00`;

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return;

        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

        if (!monthsMap[key]) {
          monthsMap[key] = {
            name: formatter.format(date),
            total: 0,
            timestamp: date.getTime(),
          };
        }

        const cost = Number(record.cost);
        if (Number.isFinite(cost) && cost >= 0) {
          monthsMap[key].total += cost;
        }
      });

      return Object.values(monthsMap)
        .filter(m => Number.isFinite(m.timestamp))
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-6);
    } catch (e) {
      console.error('monthlyData aggregation failed:', e);
      return [];
    }
  }, [currentCar, lang, dataVersion]);

  /* ===================== 3. Pie Data ===================== */
  const pieData = useMemo(() => {
    const raw = [
      { name: t('fuel') || 'الوقود', value: totals.fuel, color: '#3b82f6' },
      { name: t('maintenance') || 'الصيانة', value: totals.maintenance, color: '#f59e0b' },
      { name: t('expenses') || 'المصاريف', value: totals.expenses, color: '#a855f7' },
    ];
    return raw.filter(item => Number.isFinite(item.value) && item.value > 0);
  }, [totals, t]);

  const hasAnyData = totals.total > 0;

  /* ✅ دالة تنسيق الأرقام للمحور Y (تدعم اللغات) */
  const formatYAxis = (value) => {
    if (value === 0) return '0';
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Intl.NumberFormat(localeMap[lang] || 'ar-MA', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reports') || 'التقارير'}</h1>
        
        <button 
          type="button"
          onClick={() => navigate('/report-print')} 
          aria-label={t('pdfReport') || 'تقرير PDF'}
          className="bg-[var(--primary)] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Printer size={16} aria-hidden="true" /> 
          {t('pdfReport') || 'تقرير PDF'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <p className="text-xs text-[var(--text-muted)] mb-1">{t('totalExpenses') || 'إجمالي المصاريف'}</p>
          <p className="text-xl font-extrabold text-[var(--text)]">
            {totals.total.toLocaleString()}{' '}
            <span className="text-xs font-normal">{currency}</span>
          </p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <p className="text-xs text-[var(--text-muted)] mb-1">{t('totalFuelCost') || 'إجمالي الوقود'}</p>
          <p className="text-xl font-extrabold text-blue-500">
            {totals.fuel.toLocaleString()}{' '}
            <span className="text-xs font-normal">{currency}</span>
          </p>
        </div>
      </div>

      {!hasAnyData && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl text-center">
          <PieIcon className="text-[var(--text-muted)] mx-auto mb-3 opacity-40" size={48} aria-hidden="true" />
          <p className="text-sm text-[var(--text-muted)]">
            {t('noData') || 'لا توجد بيانات كافية لعرض التقارير.'}
          </p>
        </div>
      )}

      {hasAnyData && pieData.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="text-[var(--primary)]" size={20} aria-hidden="true" />
            <h2 className="font-bold text-[var(--text)]">
              {t('expenseDistribution') || 'توزيع المصاريف'}
            </h2>
          </div>
          
          {/* ✅ الحل النهائي للوصول: جدول مخفي لقارئات الشاشة */}
          <table className="sr-only">
            <caption>{t('expenseDistribution') || 'توزيع المصاريف'}</caption>
            <thead>
              <tr>
                <th scope="col">{t('category') || 'الفئة'}</th>
                <th scope="col">{t('amount') || 'المبلغ'}</th>
              </tr>
            </thead>
            <tbody>
              {pieData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.name}</td>
                  <td>{entry.value} {currency}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="h-64 w-full" aria-hidden="true">
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) => `${Number(value).toLocaleString()} ${currency}`}
                  contentStyle={{
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--text)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[var(--text-muted)]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-green-500" size={20} aria-hidden="true" />
          <h2 className="font-bold text-[var(--text)]">
            {t('monthlyExpenses') || 'المصاريف الشهرية'}
          </h2>
        </div>
        
        {monthlyData.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] py-10">
            {t('noData') || 'لا توجد بيانات كافية لعرض المخطط.'}
          </p>
        ) : (
          <>
            {/* ✅ جدول مخفي للمخطط الشريطي */}
            <table className="sr-only">
              <caption>{t('monthlyExpenses') || 'المصاريف الشهرية'}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('month') || 'الشهر'}</th>
                  <th scope="col">{t('amount') || 'المبلغ'}</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m, index) => (
                  <tr key={index}>
                    <td>{m.name}</td>
                    <td>{m.total} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="h-64 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    tickFormatter={formatYAxis}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--surface-2)' }}
                    contentStyle={{
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--text)'
                    }}
                    formatter={(value) => `${Number(value).toLocaleString()} ${currency}`}
                  />
                  <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
