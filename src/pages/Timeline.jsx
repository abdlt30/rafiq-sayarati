import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Clock, Wrench, Fuel as FuelIcon, Wallet, TrendingUp } from 'lucide-react';

export default function Timeline() {
  const { currentCar, t, lang, currency } = useContext(AppContext); 
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // ✅ إضافة فلتر

  useEffect(() => {
    if (!currentCar) return;

    // ✅ جلب البيانات وتوحيد هيكلها
    const fuel = (dbService.getFuel() || []).filter(f => f.carId === currentCar.id).map(f => ({ ...f, type: 'fuel', title: t('addFuel') || 'تعبئة وقود' }));
    const maintenance = (dbService.getMaintenance() || []).filter(m => m.carId === currentCar.id).map(m => ({ ...m, type: 'maintenance', title: t(m.type) || m.type || t('maintenance') || 'صيانة' }));
    const expenses = (dbService.getExpenses() || []).filter(e => e.carId === currentCar.id).map(e => ({ ...e, type: 'expense', title: t(e.type) || e.type || t('expense') || 'مصروف' }));
    // ✅ إضافة الإيرادات إلى السجل
    const incomes = (dbService.getIncomes() || []).filter(i => i.carId === currentCar.id).map(i => ({ ...i, type: 'income', title: t('income') || 'إيراد', cost: i.amount }));

    const allEvents = [...fuel, ...maintenance, ...expenses, ...incomes].sort((a, b) => new Date(b.date) - new Date(a.date));
    setEvents(allEvents);
  }, [currentCar, t]);

  const formatDate = (dateString) => {
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Date(dateString).toLocaleDateString(localeMap[lang] || 'ar-MA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ✅ دالة لتحديد أيقونة ولون كل عملية
  const getEventStyle = (type) => {
    switch(type) {
      case 'fuel': return { icon: FuelIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'maintenance': return { icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      case 'income': return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' };
      default: return { icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    }
  };

  // ✅ فلترة الأحداث
  const filteredEvents = events.filter(e => filter === 'all' || e.type === filter);

  return (
    <div className="space-y-4 pb-24 px-4 min-h-screen">
      
      {/* الشريط العلوي المثبت */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('timeline') || 'سجل السيارة'}</h1>
      </div>

      {/* ✅ أزرار الفلترة (لمسة احترافية) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: t('all') || 'الكل' },
          { id: 'fuel', label: t('fuel') || 'الوقود' },
          { id: 'maintenance', label: t('maintenance') || 'الصيانة' },
          { id: 'expense', label: t('expenses') || 'المصاريف' },
          { id: 'income', label: t('income') || 'الإيرادات' }
        ].map(f => (
          <button 
            key={f.id} 
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === f.id ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* الخط الزمني */}
      {filteredEvents.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4"><Clock size={48} className="opacity-40" /></div>
          <p>{t('noData') || 'لا توجد أحداث مسجلة في هذه الفئة.'}</p>
        </div>
      ) : (
        <div className="relative border-r-2 border-[var(--border)] mr-4 pr-5 space-y-6 pb-4 mt-2">
          {filteredEvents.map((event, index) => {
            const style = getEventStyle(event.type);
            const Icon = style.icon;
            const isIncome = event.type === 'income';

            return (
              <div key={index} className="relative">
                
                {/* ✅ ضبط محاذاة الأيقونة على الخط الزمني بدقة */}
                <div className={`absolute -right-[31px] top-3 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[var(--bg)] ${style.bg} ${style.color} z-10 shadow-sm`}>
                  <Icon size={14} />
                </div>
                
                <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl shadow-sm hover:border-[var(--primary)]/30 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--text)] truncate">{event.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">{formatDate(event.date)}</p>
                      {event.odometer && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{Number(event.odometer).toLocaleString()} KM</p>
                      )}
                    </div>
                    <div className="text-end flex-shrink-0">
                      <p className={`font-bold text-sm ${isIncome ? 'text-green-500' : 'text-[var(--text)]'}`}>
                        {isIncome ? '+' : ''}{Number(event.cost || 0).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
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
