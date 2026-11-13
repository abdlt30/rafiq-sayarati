import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Clock, Fuel, Wrench, Wallet, TrendingUp } from 'lucide-react';
import { formatDate } from '../shared/utils/formatters.js';
import { safeNumber } from '../shared/utils/safeNumber.js';

export default function Timeline() {
  const { currentCar, t, currency, lang } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!currentCar) return;
      setIsLoading(true);
      try {
        const fuel = await dbService.getFuel() || [];
        const maint = await dbService.getMaintenance() || [];
        const exp = await dbService.getExpenses() || [];
        const inc = await dbService.getIncomes() || [];

        const carId = String(currentCar.id);
        const myFuel = fuel.filter(r => String(r.carId) === carId).map(r => ({ ...r, type: 'fuel' }));
        const myMaint = maint.filter(r => String(r.carId) === carId).map(r => ({ ...r, type: 'maintenance' }));
        const myExp = exp.filter(r => String(r.carId) === carId).map(r => ({ ...r, type: 'expense' }));
        const myInc = inc.filter(r => String(r.carId) === carId).map(r => ({ ...r, type: 'income', cost: r.amount }));

        const allRecords = [...myFuel, ...myMaint, ...myExp, ...myInc]
          .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

        if (isMounted) setRecords(allRecords);
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
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('carTimeline') || 'سجل السيارة'}</h1>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Clock size={48} className="opacity-40" />
          </div>
          <p>{t('noData')}</p>
        </div>
      ) : (
        <div className="relative border-s-2 border-[var(--border)] ms-4 space-y-6">
          {records.map((record, idx) => {
             const isFuel = record.type === 'fuel';
             const isMaint = record.type === 'maintenance';
             const isInc = record.type === 'income';
             const Icon = isFuel ? Fuel : isMaint ? Wrench : isInc ? TrendingUp : Wallet;
             const color = isFuel ? 'text-blue-500 bg-blue-500/10' : isMaint ? 'text-yellow-500 bg-yellow-500/10' : isInc ? 'text-green-500 bg-green-500/10' : 'text-purple-500 bg-purple-500/10';
             
             return (
               <div key={record.id || idx} className="relative ms-6">
                 <div className={`absolute -start-[35px] top-1 p-2 rounded-full border-4 border-[var(--bg)] ${color}`}>
                   <Icon size={14} />
                 </div>
                 <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl shadow-sm">
                   <div className="flex justify-between items-start mb-1">
                     <p className="font-bold text-sm text-[var(--text)]">
                       {isFuel ? t('fuel') : isMaint ? t('maintenance') : isInc ? t('income') : t('expense')}
                     </p>
                     <p className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded">
                       {formatDate(record.date, todayLocale)}
                     </p>
                   </div>
                   <p className={`text-sm font-bold ${isInc ? 'text-green-500' : 'text-[var(--text)]'}`}>
                     {isInc ? '+' : ''}{safeNumber(record.cost).toLocaleString()} {currency}
                   </p>
                   {record.odometer && <p className="text-[10px] text-[var(--text-muted)] mt-1">{t('odometer')}: {safeNumber(record.odometer).toLocaleString()} {t('km')}</p>}
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}
