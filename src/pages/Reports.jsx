import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { FileDown, Printer, PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { safeNumber } from '../shared/utils/safeNumber.js';

export default function Reports() {
  const { currentCar, t, currency } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({ fuel: 0, expenses: 0, maintenance: 0, income: 0 });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!currentCar) return;
      setIsLoading(true);
      try {
        const fetchedTotals = await dbService.getTotals(currentCar.id);
        if (isMounted) setTotals(fetchedTotals || { fuel: 0, expenses: 0, maintenance: 0, income: 0 });
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentCar]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>;

  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('reports') || 'التقارير'}</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 bg-[var(--primary)] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg">
            <Printer size={14} /> {t('pdfReport') || 'تقرير PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] border border-blue-500/20 p-4 rounded-2xl flex flex-col items-center justify-center">
          <p className="text-xs text-[var(--text-muted)] font-bold mb-1">{t('totalFuel') || 'إجمالي الوقود'}</p>
          <p className="text-xl font-extrabold text-blue-500">{safeNumber(totals.fuel).toLocaleString()} <span className="text-xs">{currency}</span></p>
        </div>
        <div className="bg-[var(--surface)] border border-red-500/20 p-4 rounded-2xl flex flex-col items-center justify-center">
          <p className="text-xs text-[var(--text-muted)] font-bold mb-1">{t('totalExpenses')}</p>
          <p className="text-xl font-extrabold text-red-500">{safeNumber(totals.expenses).toLocaleString()} <span className="text-xs">{currency}</span></p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center text-[var(--text-muted)] min-h-[200px]">
        <PieChart size={48} className="opacity-20 mb-3" />
        <p className="text-sm font-bold">{t('noChartData') || 'لا توجد بيانات كافية للرسم البياني'}</p>
        <p className="text-xs mt-1 text-center">{t('addMoreRecords') || 'أضف المزيد من السجلات لعرض التحليلات'}</p>
      </div>
    </div>
  );
}
