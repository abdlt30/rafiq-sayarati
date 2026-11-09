import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChartPie, BarChart3 } from 'lucide-react';

export default function Reports() {
  const { currentCar, currency, t, lang } = useContext(AppContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    total: 0, monthly: 0,
    categories: [], monthlyData: []
  });

  useEffect(() => {
    if (!currentCar) return;
    
    // جلب البيانات
    const fuel = dbService.getFuel().filter(r => r.carId === currentCar.id);
    const expenses = dbService.getExpenses().filter(r => r.carId === currentCar.id);
    const maintenance = dbService.getMaintenance().filter(r => r.carId === currentCar.id);

    // حسابات التقارير
    const totalFuel = fuel.reduce((s, r) => s + Number(r.cost || 0), 0);
    const totalExp = expenses.reduce((s, r) => s + Number(r.cost || 0), 0);
    const totalMaint = maintenance.reduce((s, r) => s + Number(r.cost || 0), 0);
    const grandTotal = totalFuel + totalExp + totalMaint;

    // التوزيع حسب النوع (للمخطط الدائري)
    const categories = [
      { label: t('fuel') || 'وقود', value: totalFuel, color: '#3b82f6' },
      { label: t('maintenance') || 'صيانة', value: totalMaint, color: '#f59e0b' },
      { label: t('expenses') || 'مصاريف', value: totalExp, color: '#a855f7' }
    ].filter(c => c.value > 0);

    // مصاريف آخر 6 أشهر (للمخطط الشريطي)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
      
      const mFuel = fuel.filter(r => r.date && r.date.startsWith(monthKey)).reduce((s, r) => s + Number(r.cost || 0), 0);
      const mExp = expenses.filter(r => r.date && r.date.startsWith(monthKey)).reduce((s, r) => s + Number(r.cost || 0), 0);
      const mMaint = maintenance.filter(r => r.date && r.date.startsWith(monthKey)).reduce((s, r) => s + Number(r.cost || 0), 0);
      
      monthlyData.push({
        label: d.toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'en-US', { month: 'short' }),
        value: mFuel + mExp + mMaint
      });
    }

    // حساب مصاريف الشهر الحالي
    const currentMonth = monthlyData[monthlyData.length - 1].value;

    setData({ total: grandTotal, monthly: currentMonth, categories, monthlyData });
  }, [currentCar, t, lang]);

  // دالة رسم المخطط الدائري (Donut)
  const renderDonut = () => {
    const total = data.categories.reduce((s, c) => s + c.value, 0);
    if (total === 0) return <p className="text-center text-xs text-[var(--text-muted)]">{t('noData') || 'لا توجد بيانات'}</p>;
    
    let offset = 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
            {data.categories.map((c, i) => {
              const length = (c.value / total) * circumference;
              const circle = (
                <circle key={i} cx="60" cy="60" r={radius} fill="none" stroke={c.color} strokeWidth="12"
                  strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />
              );
              offset += length;
              return circle;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-[var(--text-muted)]">{t('totalCost') || 'الإجمالي'}</span>
            <span className="text-lg font-bold text-[var(--text)]">{data.total.toLocaleString()} <span className="text-xs">{currency}</span></span>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          {data.categories.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: c.color }}></span>
              <span className="text-[10px] font-bold text-[var(--text)]">{c.label}</span>
              <span className="text-xs text-[var(--text-muted)]">{c.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // دالة رسم المخطط الشريطي (Bar)
  const renderBars = () => {
    const max = Math.max(...data.monthlyData.map(d => d.value), 1);
    return (
      <div className="flex items-end justify-between h-32 gap-2 mt-4">
        {data.monthlyData.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="w-full bg-[var(--surface-2)] rounded-t-md relative flex-1 flex items-end">
              <div className="w-full bg-[var(--primary)] rounded-t-md transition-all duration-500" style={{ height: `${(d.value / max) * 100}%` }}></div>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)]">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reports') || 'التقارير'}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">{t('totalCost') || 'الإجمالي'}</span>
          <span className="text-xl font-extrabold text-[var(--text)]">{data.total.toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">{t('monthlyCost') || 'هذا الشهر'}</span>
          <span className="text-xl font-extrabold text-[var(--text)]">{data.monthly.toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-6 text-[var(--text)]">
          <ChartPie size={18} className="text-[var(--primary)]" />
          <h2 className="font-bold text-sm">{t('distributionByType') || 'توزيع المصاريف'}</h2>
        </div>
        {renderDonut()}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-2 text-[var(--text)]">
          <BarChart3 size={18} className="text-[var(--primary)]" />
          <h2 className="font-bold text-sm">{t('monthlyExpenses') || 'المصاريف الشهرية'}</h2>
        </div>
        {renderBars()}
      </div>
    </div>
  );
}
