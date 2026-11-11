import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Clock, Wrench, Fuel as FuelIcon, Wallet, TrendingUp, Zap } from 'lucide-react';

/* ✅ مساعد رياضي: يرفض NaN/Infinity/-Infinity */
const safeNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ✅ خريطة مفاتيح عناوين الإيرادات */
const INCOME_TITLE_MAP = {
  ride: 'rideIncome',
  rental: 'rentalIncome',
  delivery: 'deliveryIncome',
  other: 'otherIncome',
};

export default function Timeline() {
  const { currentCar, t, lang, currency, dataVersion } = useContext(AppContext); 
  const [filter, setFilter] = useState('all');

  /* ===================== جمع الأحداث ===================== */
  const events = useMemo(() => {
    if (!currentCar) return [];

    try {
      const carIdStr = String(currentCar.id);

      const getFuelTitle = (record) =>
        record.energyType === 'electricity'
          ? (t('chargingSession') || 'شحن كهرباء')
          : (t('fuelFillUp') || 'تعبئة وقود');

      const fuel = (dbService.getFuel() || [])
        .filter(f => String(f.carId) === carIdStr)
        .map(f => ({
          ...f,
          type: 'fuel',
          title: getFuelTitle(f),
        }));

      const maintenance = (dbService.getMaintenance() || [])
        .filter(m => String(m.carId) === carIdStr)
        .map(m => ({
          ...m,
          type: 'maintenance',
          title: t(m.type) || m.type || t('maintenance') || 'صيانة',
        }));

      const expenses = (dbService.getExpenses() || [])
        .filter(e => String(e.carId) === carIdStr)
        .map(e => ({
          ...e,
          type: 'expense',
          title: t(e.type) || e.type || t('expense') || 'مصروف',
        }));

      const incomes = (dbService.getIncomes() || [])
        .filter(i => String(i.carId) === carIdStr)
        .map(i => ({
          ...i,
          type: 'income',
          title: t(INCOME_TITLE_MAP[i.type]) || i.type || t('income') || 'إيراد',
          cost: i.amount, 
        }));

      return [...fuel, ...maintenance, ...expenses, ...incomes].sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || ''))
      );
    } catch (e) {
      console.error('Timeline build events failed:', e);
      return [];
    }
  }, [currentCar, t, dataVersion]);

  /* ===================== تنسيق التاريخ ===================== */
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const dateStr = String(dateString).includes('T')
      ? dateString
      : `${dateString}T00:00:00`;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return d.toLocaleDateString(localeMap[lang] || 'ar-MA', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  /* ===================== أيقونة ولون حسب النوع ===================== */
  const getEventStyle = (type, energyType) => {
    if (type === 'fuel') {
      if (energyType === 'electricity') {
        return { icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10' };
      }
      return { icon: FuelIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    }
    switch (type) {
      case 'maintenance': return { icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      case 'income': return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' };
      default: return { icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    }
  };

  /* ✅ الفلترة memoized */
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter(e => e.type === filter);
  }, [events, filter]);

  const filterOptions = [
    { id: 'all', label: t('all') || 'الكل' },
    { id: 'fuel', label: t('fuel') || 'الوقود' },
    { id: 'maintenance', label: t('maintenance') || 'الصيانة' },
    { id: 'expense', label: t('expenses') || 'المصاريف' },
    { id: 'income', label: t('income') || 'الإيرادات' },
  ];

  return (
    <div className="space-y-4 pb-24 px-4 min-h-screen">
      
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('timeline') || 'سجل السيارة'}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filterOptions.map(f => (
          <button 
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f.id 
                ? 'bg-[var(--primary)] text-white shadow-md' 
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Clock size={48} className="opacity-40" />
          </div>
          <p>{t('noData') || 'لا توجد أحداث مسجلة في هذه الفئة.'}</p>
        </div>
      ) : (
        /* ✅ إصلاح RTL/LTR: استخدام الخصائص المنطقية border-s و ms و ps */
        <div 
          className="relative border-s-2 border-[var(--border)] ms-4 ps-5 space-y-6 pb-4 mt-2"
          role="list"
        >
          {filteredEvents.map((event, index) => {
            const style = getEventStyle(event.type, event.energyType);
            const Icon = style.icon;
            const isIncome = event.type === 'income';

            const cost = safeNumber(event.cost);
            const odo = safeNumber(event.odometer);

            const key = `${event.type}-${event.id || event.date || index}`;

            return (
              <div key={key} className="relative" role="listitem">
                
                {/* ✅ إصلاح RTL/LTR: استخدام -start بدلاً من -right */}
                <div 
                  className={`absolute -start-[31px] top-3 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[var(--bg)] ${style.bg} ${style.color} z-10 shadow-sm`}
                >
                  {/* ✅ إضافة aria-hidden للأيقونة الزخرفية */}
                  <Icon size={14} aria-hidden="true" />
                </div>
                
                <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl shadow-sm hover:border-[var(--primary)]/30 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--text)] truncate">{event.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">
                        {formatDate(event.date)}
                      </p>
                      {odo > 0 && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">
                          {odo.toLocaleString()} {t('km') || 'KM'}
                        </p>
                      )}
                    </div>
                    <div className="text-end flex-shrink-0">
                      <p className={`font-bold text-sm ${isIncome ? 'text-green-500' : 'text-[var(--text)]'}`}>
                        {isIncome ? '+' : ''}{cost.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
