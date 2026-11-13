import { useContext, useState, useCallback, useMemo } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Link } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  ChevronLeft, Pencil, Check, X, Bell, Settings,
  AlertTriangle, ShieldAlert, TrendingUp, CheckCircle
} from 'lucide-react'; 
import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_TOTALS = { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0 };

export default function Dashboard() {
  // ✅ جلب البيانات من المخ المركزي
  const { currentCar, updateCar, t, currency, user, lang, dataVersion, totals, recentActivity } = useContext(AppContext);

  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');

  const greeting = user?.name ? `مرحباً، ${user.name} 👋` : 'مرحباً بك 👋';
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const today = new Date().toLocaleDateString(todayLocale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleSaveOdometer = useCallback(() => {
    const raw = String(newOdo).trim();
    if (raw === '') return; 
    const val = Number(raw);
    if (!Number.isFinite(val) || val < 0) return;

    const currentVal = safeNumber(currentCar.odometer);
    if (val < currentVal && !window.confirm(t('confirmLowerOdometer') || 'العداد الجديد أقل من العداد الحالي. هل أنت متأكد؟')) {
      return;
    }

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

  return (
    <div className="space-y-5 pb-24 px-4 pt-2">
      {/* ... (نفس تصميم الـ Dashboard السابق، فقط احذف منه حساب الـ avgConsumption لأننا سنتركه للسيارة الحالية) */}
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

      {/* بطاقة السيارة */}
      <div className="bg-gradient-to-br from-blue-900/40 to-[var(--surface)] border border-blue-500/20 p-4 rounded-3xl relative overflow-hidden shadow-lg">
        <p className="text-xs text-blue-300 font-bold mb-3">{t('currentCar')}</p>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
            {currentCar.image ? <img src={currentCar.image} alt="car" className="w-full h-full object-cover" /> : <Car size={28} className="text-white/50" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white leading-tight truncate">{currentCar.make} {currentCar.model}</h2>
            <p className="text-xs font-mono text-blue-200 mt-1 bg-blue-500/20 px-2 py-0.5 rounded inline-block truncate max-w-full">{currentCar.plate || t('noPlate')}</p>
          </div>
        </div>
      </div>

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <Link to="/fuel" className="flex flex-col items-center justify-center p-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"><Fuel size={18} className="text-blue-500 mb-1"/><span className="text-[10px] font-bold">{t('fuel')}</span></Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center p-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"><Wrench size={18} className="text-yellow-500 mb-1"/><span className="text-[10px] font-bold">{t('maintenance')}</span></Link>
        <Link to="/expenses" className="flex flex-col items-center justify-center p-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"><Wallet size={18} className="text-purple-500 mb-1"/><span className="text-[10px] font-bold">{t('expenses')}</span></Link>
        <Link to="/documents" className="flex flex-col items-center justify-center p-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"><FileText size={18} className="text-green-500 mb-1"/><span className="text-[10px] font-bold">{t('documents')}</span></Link>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[var(--surface)] border border-green-500/20 p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalIncome')}</p>
          <p className="text-lg font-extrabold text-green-500 truncate">{incomeValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        <div className="bg-[var(--surface)] border border-red-500/20 p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalExpenses')}</p>
          <p className="text-lg font-extrabold text-red-500 truncate">{totalValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        <div className={`col-span-2 border p-3 rounded-2xl flex justify-between items-center ${isNetPositive ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('netProfit')}</p>
            <p className={`text-xl font-extrabold ${isNetPositive ? 'text-green-500' : 'text-red-500'}`}>{netValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
          </div>
        </div>
        
        {/* العداد */}
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('odometer')}</p>
          {isEditingOdo ? (
            <div className="flex items-center gap-1 mt-1">
              <input type="number" value={newOdo} onChange={(e) => setNewOdo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveOdometer()} className="w-full bg-[var(--surface-2)] border border-[var(--primary)] rounded-md px-1 py-0.5 text-sm font-bold outline-none" autoFocus />
              <button type="button" onClick={handleSaveOdometer} className="text-green-500 p-1 bg-green-500/10 rounded"><Check size={14} /></button>
              <button type="button" onClick={() => setIsEditingOdo(false)} className="text-red-500 p-1 bg-red-500/10 rounded"><X size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-lg font-extrabold text-blue-500">{odometerValue.toLocaleString()} <span className="text-xs font-normal">{t('km')}</span></p>
              <button type="button" onClick={() => { setNewOdo(String(odometerValue)); setIsEditingOdo(true); }} className="p-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md"><Pencil size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {/* آخر العمليات */}
      <div className="mt-4">
        <h3 className="font-bold text-sm mb-2">{t('recentActivity')}</h3>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">{t('noData')}</div>
          ) : (
            recentActivity.map((activity, index) => {
              const isFuel = activity.type === 'fuel';
              const isIncome = activity.type === 'income';
              const safeCost = safeNumber(activity.cost);
              return (
                <div key={index} className="flex justify-between items-center p-3 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isFuel ? 'bg-blue-500/10 text-blue-500' : isIncome ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>
                      {isFuel ? <Fuel size={16} /> : isIncome ? <TrendingUp size={16} /> : <Wallet size={16} />}
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
