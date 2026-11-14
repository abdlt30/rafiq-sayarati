import { useContext, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Link } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  ChevronLeft, Pencil, Check, X, Bell, Settings,
  TrendingUp, Activity, Plus // ✅ إضافة أيقونات جديدة
} from 'lucide-react'; 

import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';
// ✅ استيراد مبدل السيارة من المسار الصحيح في مجلد الميزات
import CarSelector from '../features/vehicles/components/CarSelector.jsx'; 

export default function Dashboard() {
  const { currentCar, updateCar, t, currency, user, lang, totals, recentActivity } = useContext(AppContext);

  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');

  const greeting = user?.name ? `مرحباً، ${user.name} 👋` : 'مرحباً بك 👋';
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const today = new Date().toLocaleDateString(todayLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleSaveOdometer = useCallback(() => {
    const raw = String(newOdo).trim();
    if (raw === '') return; 
    const val = Number(raw);
    if (!Number.isFinite(val) || val < 0) return;

    const currentVal = safeNumber(currentCar.odometer);
    if (val < currentVal && !window.confirm(t('confirmLowerOdometer') || 'العداد الجديد أقل من العداد الحالي. هل أنت متأكد؟')) return;

    try {
      updateCar(currentCar.id, { odometer: val });
      setIsEditingOdo(false);
    } catch (error) {
      alert(t('errorSaving') || 'حدث خطأ أثناء حفظ العداد.');
    }
  }, [newOdo, currentCar, updateCar, t]);

  const netValue = safeNumber(totals?.net);
  const isNetPositive = netValue >= 0;
  const incomeValue = safeNumber(totals?.income);
  const totalValue = safeNumber(totals?.total);
  const odometerValue = safeNumber(currentCar.odometer);
  const avgValue = totals?.avgConsumption || null;
  const avgUnit = currentCar?.powertrain === 'ev' ? 'kWh/100km' : 'L/100km';

  return (
    <div className="space-y-5 pb-24 px-4 pt-2">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-start sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 mb-2 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-[var(--text)] truncate">{greeting}</h1>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold truncate">{today}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/notifications" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors relative">
            <Bell size={18} />
          </Link>
          <Link to="/settings" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* ✅ بطاقة السيارة مع مبدل السيارة المدمج */}
      <div className="bg-gradient-to-br from-blue-900/40 to-[var(--surface)] border border-blue-500/20 p-4 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="flex justify-between items-start mb-3 relative z-10">
          <p className="text-xs text-blue-300 font-bold">{t('currentCar')}</p>
          
          {/* زر تبديل السيارة المدمج */}
          <div className="scale-90 origin-top-left rtl:origin-top-right">
            <CarSelector />
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
            {currentCar.image ? <img src={currentCar.image} alt="car" className="w-full h-full object-cover" /> : <Car size={28} className="text-white/50" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight truncate">{currentCar.make} {currentCar.model}</h2>
            <p className="text-xs font-mono text-blue-200 mt-1 bg-blue-500/20 px-2 py-0.5 rounded inline-block truncate max-w-full">{currentCar.plate || t('noPlate')}</p>
          </div>
        </div>
      </div>

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <Link to="/fuel" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 active:scale-95 transition-all"><div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg mb-2"><Fuel size={18}/></div><span className="text-[10px] font-bold">{t('fuel')}</span></Link>
        <Link to="/maintenance" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-yellow-500/50 active:scale-95 transition-all"><div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg mb-2"><Wrench size={18}/></div><span className="text-[10px] font-bold">{t('maintenance')}</span></Link>
        <Link to="/expenses" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-purple-500/50 active:scale-95 transition-all"><div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg mb-2"><Wallet size={18}/></div><span className="text-[10px] font-bold">{t('expenses')}</span></Link>
        <Link to="/documents" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-green-500/50 active:scale-95 transition-all"><div className="p-2 bg-green-500/10 text-green-500 rounded-lg mb-2"><FileText size={18}/></div><span className="text-[10px] font-bold">{t('documents')}</span></Link>
      </div>

      {/* الإحصائيات بتصميم حديث */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[var(--surface)] border border-green-500/20 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalIncome')}</p>
          <p className="text-xl font-extrabold text-green-500 truncate">{incomeValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        <div className="bg-[var(--surface)] border border-red-500/20 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalExpenses')}</p>
          <p className="text-xl font-extrabold text-red-500 truncate">{totalValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        
        <div className={`col-span-2 border p-4 rounded-2xl flex justify-between items-center ${isNetPositive ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30' : 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30'}`}>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('netProfit')}</p>
            <p className={`text-2xl font-extrabold ${isNetPositive ? 'text-green-500' : 'text-red-500'}`}>{netValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
          </div>
          <TrendingUp size={36} className={isNetPositive ? 'text-green-500/20' : 'text-red-500/20'} />
        </div>

        {/* العداد والاستهلاك */}
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('odometer')}</p>
          {isEditingOdo ? (
            <div className="flex items-center gap-1 mt-1">
              <input type="number" value={newOdo} onChange={(e) => setNewOdo(e.target.value)} className="w-full bg-[var(--surface-2)] border border-[var(--primary)] rounded-md px-1 py-0.5 text-sm font-bold outline-none" autoFocus />
              <button onClick={handleSaveOdometer} className="text-green-500 p-1 bg-green-500/10 rounded"><Check size={14}/></button>
              <button onClick={() => setIsEditingOdo(false)} className="text-red-500 p-1 bg-red-500/10 rounded"><X size={14}/></button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-lg font-extrabold text-blue-500">{odometerValue.toLocaleString()}</p>
              <button onClick={() => { setNewOdo(String(odometerValue)); setIsEditingOdo(true); }} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md"><Pencil size={14}/></button>
            </div>
          )}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('avgConsumption')}</p>
          <p className="text-lg font-extrabold text-yellow-500 flex items-center gap-1 mt-1">
            {avgValue !== null ? avgValue : '—'} <span className="text-[10px] font-normal text-[var(--text-muted)]">{avgUnit}</span>
          </p>
        </div>
      </div>

      {/* آخر العمليات (مع تصميم Empty State احترافي) */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm">{t('recentActivity')}</h3>
          <Link to="/timeline" className="text-xs text-[var(--primary)] font-bold flex items-center">{t('viewAll')} <ChevronLeft size={14} className="rtl:rotate-0 ltr:rotate-180"/></Link>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[var(--surface-2)] rounded-full flex items-center justify-center mb-3">
                <Activity size={24} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-sm font-bold text-[var(--text)] mb-2">{t('noData')}</p>
              <Link to="/fuel" className="flex items-center gap-1 text-xs text-white bg-[var(--primary)] px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Plus size={14}/> {t('addFuel') || 'إضافة وقود'}
              </Link>
            </div>
          ) : (
            recentActivity.map((activity, index) => {
              const isFuel = activity.type === 'fuel';
              const isIncome = activity.type === 'income';
              const safeCost = safeNumber(activity.cost);
              return (
                <div key={index} className="flex justify-between items-center p-3 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isFuel ? 'bg-blue-500/10 text-blue-500' : isIncome ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>
                      {isFuel ? <Fuel size={16}/> : isIncome ? <TrendingUp size={16}/> : <Wallet size={16}/>}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{isFuel ? t('fuel') : isIncome ? t('income') : t('expense')}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{formatDate(activity.date, todayLocale)}</p>
                    </div>
                  </div>
                  <p className={`text-xs font-bold ${isIncome ? 'text-green-500' : 'text-[var(--text)]'}`}>{isIncome ? '+' : ''}{safeCost} {currency}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
