import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Clock, Wrench, Fuel as FuelIcon, Wallet } from 'lucide-react';

export default function Timeline() {
  const { currentCar, t, lang } = useContext(AppContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!currentCar) return;

    // جلب البيانات من جميع الجداول
    const fuel = (dbService.getFuel() || []).filter(f => f.carId === currentCar.id).map(f => ({ ...f, type: 'fuel', icon: FuelIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' }));
    const maintenance = (dbService.getMaintenance() || []).filter(m => m.carId === currentCar.id).map(m => ({ ...m, type: 'maintenance', icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }));
    const expenses = (dbService.getExpenses() || []).filter(e => e.carId === currentCar.id).map(e => ({ ...e, type: 'expense', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10' }));

    // دمجها في مصفوفة واحدة وترتيبها حسب التاريخ
    const allEvents = [...fuel, ...maintenance, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    setEvents(allEvents);
  }, [currentCar]);

  const formatDate = (dateString) => {
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Date(dateString).toLocaleDateString(localeMap[lang] || 'ar-MA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 pb-24 px-4">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('timeline') || 'سجل السيارة'}</h1>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4"><Clock size={48} className="opacity-40" /></div>
          <p>لا توجد أحداث مسجلة بعد.</p>
        </div>
      ) : (
        <div className="relative border-r-2 border-[var(--border)] mr-4 pr-4 space-y-6">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={index} className="relative">
                {/* النقطة على الخط الزمني */}
                <div className={`absolute -right-[25px] top-2 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[var(--bg)] ${event.bg} ${event.color}`}>
                  <Icon size={14} />
                </div>
                
                {/* بطاقة الحدث */}
                <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl shadow-sm ml-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-[var(--text)]">
                        {event.type === 'fuel' ? 'تعبئة وقود' : event.type === 'maintenance' ? event.title || 'صيانة' : event.title || 'مصروف'}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatDate(event.date)}</p>
                    </div>
                    <p className="font-bold text-sm text-[var(--text)]">
                      {event.cost} <span className="text-[10px] font-normal">{t('currency') || 'د.أ'}</span>
                    </p>
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
