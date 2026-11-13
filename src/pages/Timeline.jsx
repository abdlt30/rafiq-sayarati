import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Clock, Wrench, Fuel as FuelIcon, Wallet, TrendingUp, Zap } from 'lucide-react';

// ✅ 1. استيراد الدوال المشتركة من الهيكل الجديد
import { safeNumber } from '../shared/utils/safeNumber';
import { formatDate as formatDateShared } from '../shared/utils/formatters';

/* ✅ خريطة مفاتيح عناوين الإيرادات */
const INCOME_TITLE_MAP = {
  ride: 'rideIncome',
  rental: 'rentalIncome',
  delivery: 'deliveryIncome',
  other: 'otherIncome',
};

export default function Timeline() {
  const { currentCar, t, lang, dataVersion } = useContext(AppContext); 
  const [filter, setFilter] = useState('all');
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  /* ===================== تنسيق التاريخ ===================== */
  const formatDate = (dateString) => formatDateShared(dateString, todayLocale);

  /* ===================== جمع الأحداث ===================== */
  const events = useMemo(() => {
    if (!currentCar) return [];

    try {
      const carIdStr = String(currentCar.id);

      // ✅ عنوان الوقود: تمييز الكهرباء عن البنزين
      const getFuelTitle = (record) =>
        record.energyType === 'electricity'
          ? t('chargingSession')
          : t('fuel');

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
          title: t(m.type) || m.type,
        }));

      const expenses = (dbService.getExpenses() || [])
        .filter(e => String(e.carId) === carIdStr)
        .map(e => ({
          ...e,
          type: 'expense',
          title: t(e.type) || e.type,
        }));

      const incomes = (dbService.getIncomes() || [])
        .filter(i => String(i.carId) === carIdStr)
        .map(i => ({
          ...i,
          type: 'income',
          title: t(INCOME_TITLE_MAP[i.type]) || i.type,
          cost: i.amount, // ✅ توحيد الحقل
        }));

      // ✅ ترتيب مستقر بـ localeCompare
      return [...fuel, ...maintenance, ...expenses, ...incomes].sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || ''))
      );
    } catch (e) {
      console.error('Timeline build events failed:', e);
      return [];
    }
  }, [currentCar, t, dataVersion]);

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

  /* ✅ خيارات الفلترة */
  const filterOptions = [
    { id: 'all', label: t('all') },
    { id: 'fuel', label: t('fuel') },
    { id: 'maintenance', label: t('maintenance') },
    { id: 'expense', label: t('expenses') },
    { id: 'income', label: t('income') },
  ];

  return (
    <div className="space-y-4 pb-24 px-4 min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('timeline')}</h1>
      </div>

      {/* أزرار الفلترة */}
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

      {/* الخط الزمني */}
      {filteredEvents.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Clock size={48} className="opacity-40" aria-hidden="true" />
          </div>
          <p>{t('noData')}</p>
        </div>
      ) : (
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
                
                {/* الأيقونة على الخط الزمني */}
                <div className={`absolute -start-[31px] top-3 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[var(--bg)] ${style.bg} ${style.color} z-10 shadow-sm`}>
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
                          {odo.toLocaleString()} {t('km')}
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
