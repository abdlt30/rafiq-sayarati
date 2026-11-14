import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Clock, Fuel, Wrench, Wallet, TrendingUp, Plus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ إضافة Link للربط
import { formatDate } from '../shared/utils/formatters.js';
import { safeNumber } from '../shared/utils/safeNumber.js';

export default function Timeline() {
  const { currentCar, t, currency, lang, dataVersion } = useContext(AppContext); // ✅ إضافة dataVersion للتحديث التلقائي
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
  }, [currentCar, dataVersion]);

  // ✅ 1. شاشة التحميل الهيكلية (Skeleton Loader)
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse mt-4">
        <div className="h-10 bg-[var(--surface-2)] rounded-lg w-1/3 mb-6"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 bg-[var(--surface-2)] rounded-full shrink-0"></div>
            <div className="flex-1 h-20 bg-[var(--surface-2)] rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('carTimeline') || 'سجل السيارة'}</h1>
        <Link to="/fuel" className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] active:scale-90 transition-all">
          <Plus size={20} />
        </Link>
      </div>

      {records.length === 0 ? (
        // ✅ 2. حالة الفراغ التفاعلية
        <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <Clock size={36} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">{t('startYourJourney') || 'ابدأ رحلتك!'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">{t('noData') || 'لا توجد سجلات.'} أضف أول تعبئة وقود أو صيانة لتبدأ في بناء سجل سيارتك.</p>
          <Link to="/fuel" className="flex items-center gap-2 text-white bg-[var(--primary)] px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 shadow-lg">
            <Plus size={18} /> {t('addFuel') || 'إضافة وقود'}
          </Link>
        </div>
      ) : (
        <div className="relative border-s-2 border-[var(--border)] ms-4 space-y-6 pb-6">
          {records.map((record, idx) => {
             const isFuel = record.type === 'fuel';
             const isMaint = record.type === 'maintenance';
             const isInc = record.type === 'income';
             const Icon = isFuel ? Fuel : isMaint ? Wrench : isInc ? TrendingUp : Wallet;
             const color = isFuel ? 'text-blue-500 bg-blue-500/10' : isMaint ? 'text-yellow-500 bg-yellow-500/10' : isInc ? 'text-green-500 bg-green-500/10' : 'text-purple-500 bg-purple-500/10';
             const borderCol = isFuel ? 'border-blue-500/30' : isMaint ? 'border-yellow-500/30' : isInc ? 'border-green-500/30' : 'border-purple-500/30';
             
             return (
               <div key={record.id || idx} className="relative ms-6">
                 {/* النقطة الزمنية */}
                 <div className={`absolute -start-[35px] top-2 p-2 rounded-full border-4 border-[var(--bg)] ${color} shadow-sm z-10`}>
                   <Icon size={14} aria-hidden="true" />
                 </div>
                 
                 {/* بطاقة السجل */}
                 <div className={`bg-[var(--surface)] border border-[var(--border)] border-s-4 ${borderCol} p-3.5 rounded-xl shadow-sm hover:shadow-md transition-shadow`}>
                   <div className="flex justify-between items-start mb-1.5">
                     <p className="font-bold text-sm text-[var(--text)]">
                       {isFuel ? (t('fuel') || 'وقود') : isMaint ? (t('maintenance') || 'صيانة') : isInc ? (t('income') || 'إيراد') : (t('expense') || 'مصروف')}
                     </p>
                     <p className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md font-mono">
                       {formatDate(record.date, todayLocale)}
                     </p>
                   </div>
                   
                   <p className={`text-base font-extrabold ${isInc ? 'text-green-500' : 'text-[var(--text)]'}`}>
                     {isInc ? '+' : ''}{safeNumber(record.cost).toLocaleString()} <span className="text-xs font-normal">{currency}</span>
                   </p>
                   
                   {/* تفاصيل إضافية */}
                   {record.odometer && (
                     <p className="text-[10px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                       <AlertCircle size={10} /> {t('odometer') || 'العداد'}: {safeNumber(record.odometer).toLocaleString()} {t('km') || 'كم'}
                     </p>
                   )}
                   {isMaint && record.type && t(record.type) && (
                     <p className="text-[10px] text-[var(--text-muted)] mt-1.5 bg-[var(--surface-2)] inline-block px-2 py-0.5 rounded">
                       {t(record.type)}
                     </p>
                   )}
                 </div>
               </div>
             )
          })}
          
          {/* ✅ 3. علامة بداية الطريق (Start of Journey) */}
          <div className="relative ms-6 mt-8">
            <div className="absolute -start-[35px] top-1 p-2 rounded-full border-4 border-[var(--bg)] bg-[var(--surface-2)] text-[var(--text-muted)] z-10">
              <Clock size={14} />
            </div>
            <div className="bg-[var(--surface-2)] border border-[var(--border)] border-dashed p-3 rounded-xl text-center">
              <p className="text-xs font-bold text-[var(--text-muted)]">
                {t('startOfJourney') || 'بداية الطريق'} • {t('appName')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
