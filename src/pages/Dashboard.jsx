import { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js'; // ✅ إضافة .js
import { notificationService } from '../services/notificationService.js'; // ✅ إضافة .js
import { Link } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  ChevronLeft, Pencil, Check, X, Bell, Settings,
  AlertTriangle, ShieldAlert, TrendingUp, CheckCircle
} from 'lucide-react'; 

import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_TOTALS = { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0 };

const canQuickDone = (alert) =>
  alert &&
  alert.recordId &&
  (alert.sourceTable === 'maintenance' || alert.sourceTable === 'reminder');

export default function Dashboard() {
  const { currentCar, updateCar, t, currency, user, lang, dataVersion, bumpDataVersion } = useContext(AppContext);

  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');

  // ✅ حالات جديدة لجلب البيانات غير المتزامنة
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [avgConsumption, setAvgConsumption] = useState({ value: null, unit: 'L/100km' });
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const greeting = user?.name ? (t('welcomeUser') || `مرحباً، ${user.name} 👋`) : (t('welcome') || 'مرحباً بك 👋');
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  /* ===================== جلب البيانات غير المتزامن ===================== */
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      if (!currentCar) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // 1. جلب الإحصائيات
        const fetchedTotals = await dbService.getTotals(currentCar.id);
        
        // 2. جلب كافة السجلات لآخر العمليات ومتوسط الاستهلاك
        const fuelRecords = await dbService.getFuel();
        const maintenanceRecords = await dbService.getMaintenance();
        const expenseRecords = await dbService.getExpenses();
        const incomeRecords = await dbService.getIncomes();

        const carIdStr = String(currentCar.id);
        const filter = (arr) => (Array.isArray(arr) ? arr : []).filter(r => String(r.carId) === carIdStr);

        // 3. حساب آخر العمليات
        const activities = [
          ...filter(fuelRecords).map(f => ({ ...f, type: 'fuel' })),
          ...filter(maintenanceRecords).map(m => ({ ...m, type: 'maintenance' })),
          ...filter(expenseRecords).map(e => ({ ...e, type: 'expense' })),
          ...filter(incomeRecords).map(i => ({ ...i, type: 'income', cost: i.amount }))
        ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 4);

        // 4. حساب متوسط الاستهلاك
        const powertrain = currentCar.powertrain || 'ice';
        const targetEnergy = powertrain === 'ev' ? 'electricity' : 'gasoline';
        const unit = targetEnergy === 'electricity' ? 'kWh/100km' : 'L/100km';
        
        const carFuel = filter(fuelRecords).filter(f => (f.energyType || 'gasoline') === targetEnergy);
        let avgVal = null;
        if (carFuel.length >= 2) {
          const normalized = carFuel.map(f => ({ ...f, _odo: safeNumber(f.odometer) })).filter(f => f._odo > 0).sort((a, b) => a._odo - b._odo);
          let tAmt = 0, tDist = 0;
          for (let i = 1; i < normalized.length; i++) {
            const dist = normalized[i]._odo - normalized[i - 1]._odo;
            const amt = safeNumber(normalized[i].amount ?? normalized[i].liters);
            if (dist > 0 && amt > 0) { tDist += dist; tAmt += amt; }
          }
          if (tDist > 0) {
            const res = (tAmt / tDist) * 100;
            if (Number.isFinite(res) && res > 0) avgVal = Number(res.toFixed(1));
          }
        }

        // 5. التنبيهات
        const alerts = notificationService.generateSmartAlerts(currentCar, t, lang);
        const filteredAlerts = (alerts || []).filter(a => a.severity === 'critical' || a.severity === 'warning').slice(0, 3);

        // تحديث الحالة
        if (isMounted) {
          setTotals(fetchedTotals || EMPTY_TOTALS);
          setRecentActivity(activities);
          setAvgConsumption({ value: avgVal, unit });
          setCriticalAlerts(filteredAlerts);
        }
      } catch (error) {
        console.error("Dashboard data load failed:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => { isMounted = false; }; // تنظيف الذاكرة
  }, [currentCar, dataVersion, t, lang]);

  if (!currentCar) return null;

  const today = new Date().toLocaleDateString(todayLocale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  /* ✅ حماية العداد */
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
      console.error("Failed to update odometer:", error);
      alert(t('errorSaving') || 'حدث خطأ أثناء حفظ العداد.');
    }
  }, [newOdo, currentCar, updateCar, t]);

  /* ✅ 4. توزيع الحذف (أصبح async) */
  const handleQuickDone = useCallback(async (e, alert) => {
    e.preventDefault();
    e.stopPropagation();

    if (!alert.recordId || !alert.sourceTable) return;
    if (alert.sourceTable !== 'maintenance' && alert.sourceTable !== 'reminder') return;

    const targetName = alert.sourceTable === 'maintenance' ? (t('maintenanceRecord') || 'سجل الصيانة') : (t('reminder') || 'التذكير');
    const confirmMsg = t('confirmCompleteAction', { title: alert.title, target: targetName }) || `هل أنت متأكد من إتمام: ${alert.title}؟\nسيتم حذف ${targetName} نهائياً.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (alert.sourceTable === 'maintenance') {
        await dbService.deleteMaintenance(alert.recordId); // ✅ أصبح async
      } else if (alert.sourceTable === 'reminder') {
        await dbService.deleteReminder(alert.recordId); // ✅ أصبح async
      }
      if (bumpDataVersion) bumpDataVersion();
    } catch (err) {
      console.error('Quick done failed:', err);
    }
  }, [bumpDataVersion, t]);

  /* ✅ قيم آمنة للعرض */
  const netValue = safeNumber(totals.net);
  const isNetPositive = netValue >= 0;
  const incomeValue = safeNumber(totals.income);
  const totalValue = safeNumber(totals.total);
  const odometerValue = safeNumber(currentCar.odometer);

  // ✅ شاشة تحميل بسيطة أثناء جلب البيانات
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[var(--primary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 px-4 pt-2">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-start sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 mb-2 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-[var(--text)] truncate">{greeting}</h1>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold truncate">{today}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to="/notifications"
            aria-label={t('notifications')}
            className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors relative"
          >
            <Bell size={18} aria-hidden="true" />
            {criticalAlerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--surface)]"></span>
            )}
          </Link>
          <Link
            to="/settings"
            aria-label={t('settings')}
            className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
          >
            <Settings size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* بطاقة السيارة الحالية */}
      <div className="bg-gradient-to-br from-blue-900/40 to-[var(--surface)] border border-blue-500/20 p-4 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Car size={100} aria-hidden="true" /></div>
        <p className="text-xs text-blue-300 font-bold mb-3">{t('currentCar')}</p>
        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-16 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
            {currentCar.image ? (
              <img 
                src={currentCar.image.startsWith('data:') || currentCar.image.startsWith('http') ? currentCar.image : `${import.meta.env.BASE_URL}${currentCar.image.replace(/^\//, '')}`} 
                alt="car" className="w-full h-full object-cover" 
              />
            ) : (
              <Car size={28} className="text-white/50" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
              {currentCar.make} {currentCar.model}
            </h2>
            <p className="text-[11px] sm:text-sm font-mono text-blue-200 mt-1 bg-blue-500/20 px-2 py-0.5 rounded inline-block truncate max-w-full">
              {currentCar.plate || t('noPlate')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 relative z-10">
          <Link to="/vehicles" className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold py-2.5 rounded-xl text-center backdrop-blur-md transition-colors">
            {t('switchCar')}
          </Link>
          <Link to="/add-vehicle" className="flex-1 bg-[var(--primary)] hover:bg-blue-600 text-white text-[11px] sm:text-xs font-bold py-2.5 rounded-xl text-center shadow-lg transition-colors">
            {t('addNewCar')} +
          </Link>
        </div>
      </div>

      {/* التنبيهات */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          <h3 className="text-xs font-bold text-[var(--text-muted)] px-1 mb-1">
            {t('alertsNeedAttention')}
          </h3>
          {criticalAlerts.map((alert, idx) => {
            const key = alert.id || alert.recordId || `alert-${idx}`;
            const showDoneBtn = canQuickDone(alert);

            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                }`}
              >
                <Link to={alert.link} className="flex-1 flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl ${alert.severity === 'critical' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                    {alert.severity === 'critical' ? <AlertTriangle size={18} aria-hidden="true" /> : <ShieldAlert size={18} aria-hidden="true" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{alert.title}</p>
                    <p className="text-[11px] opacity-80 truncate mt-0.5">{alert.desc}</p>
                  </div>
                </Link>

                {showDoneBtn ? (
                  <button
                    type="button"
                    onClick={(e) => handleQuickDone(e, alert)}
                    aria-label={alert.sourceTable === 'maintenance' ? t('completeMaintenance') : t('completeReminder')}
                    className="bg-green-500 text-white p-2 rounded-xl shadow-lg hover:bg-green-600 active:scale-90 transition-all flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
                  >
                    <CheckCircle size={16} aria-hidden="true" />
                    <span className="text-[9px] font-bold">{t('done')}</span>
                  </button>
                ) : (
                  <Link to={alert.link} aria-label={t('viewDetails')} className="p-2 flex-shrink-0">
                    <ChevronLeft size={16} className="opacity-50 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link to="/fuel" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 active:scale-95 transition-all">
          <div className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-500 rounded-lg mb-1 sm:mb-2"><Fuel size={18} aria-hidden="true" /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">{t('fuel')}</span>
        </Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-yellow-500/50 active:scale-95 transition-all">
          <div className="p-1.5 sm:p-2 bg-yellow-500/10 text-yellow-500 rounded-lg mb-1 sm:mb-2"><Wrench size={18} aria-hidden="true" /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">{t('maintenance')}</span>
        </Link>
        <Link to="/expenses" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-purple-500/50 active:scale-95 transition-all">
          <div className="p-1.5 sm:p-2 bg-purple-500/10 text-purple-500 rounded-lg mb-1 sm:mb-2"><Wallet size={18} aria-hidden="true" /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">{t('expenses')}</span>
        </Link>
        <Link to="/documents" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-green-500/50 active:scale-95 transition-all">
          <div className="p-1.5 sm:p-2 bg-green-500/10 text-green-500 rounded-lg mb-1 sm:mb-2"><FileText size={18} aria-hidden="true" /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">{t('documents')}</span>
        </Link>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[var(--surface)] border border-green-500/20 p-3 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">{t('totalIncome')}</p>
          <p className="text-lg sm:text-xl font-extrabold text-green-500 truncate">
            {incomeValue.toLocaleString()}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)]">{currency}</span>
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-red-500/20 p-3 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">{t('totalExpenses')}</p>
          <p className="text-lg sm:text-xl font-extrabold text-red-500 truncate">
            {totalValue.toLocaleString()}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)]">{currency}</span>
          </p>
        </div>

        <div className={`col-span-2 border p-3 sm:p-4 rounded-2xl flex justify-between items-center ${isNetPositive ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div>
            <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">{t('netProfit')}</p>
            <p className={`text-xl sm:text-2xl font-extrabold flex items-center gap-1 ${isNetPositive ? 'text-green-500' : 'text-red-500'}`}>
              {netValue.toLocaleString()}{' '}
              <span className="text-xs font-normal">{currency}</span>
            </p>
          </div>
          <TrendingUp size={32} className={isNetPositive ? 'text-green-500/20' : 'text-red-500/20'} aria-hidden="true" />
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">{t('odometer')}</p>
          {isEditingOdo ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number" inputMode="numeric" min="0" value={newOdo}
                onChange={(e) => setNewOdo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveOdometer()}
                placeholder={String(odometerValue)} aria-label={t('editOdometer')}
                className="w-full bg-[var(--surface-2)] border border-[var(--primary)] rounded-md px-1 py-0.5 text-sm font-bold text-[var(--text)] outline-none" autoFocus
              />
              <button type="button" onClick={handleSaveOdometer} aria-label={t('save')} className="text-green-500 p-1 bg-green-500/10 rounded">
                <Check size={14} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setIsEditingOdo(false)} aria-label={t('cancel')} className="text-red-500 p-1 bg-red-500/10 rounded">
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-lg sm:text-xl font-extrabold text-blue-500 flex items-center gap-1 truncate">
                {odometerValue.toLocaleString()}{' '}
                <span className="text-[10px] sm:text-xs font-normal">{t('km')}</span>
              </p>
              <button
                type="button" onClick={() => { setNewOdo(String(odometerValue)); setIsEditingOdo(true); }}
                aria-label={t('editOdometer')}
                className="p-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md hover:bg-[var(--primary)]/20 transition-colors flex-shrink-0"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">{t('avgConsumption')}</p>
          <p className="text-lg sm:text-xl font-extrabold text-yellow-500 flex items-center gap-1">
            {avgConsumption.value !== null ? avgConsumption.value : '—'}{' '}
            <span className="text-[10px] sm:text-xs font-normal">{avgConsumption.unit}</span>
          </p>
        </div>
      </div>

      {/* آخر العمليات */}
      <div>
        <div className="flex justify-between items-center mb-3 mt-4">
          <h3 className="font-bold text-[var(--text)] text-sm">{t('recentActivity')}</h3>
          <Link to="/timeline" className="text-xs text-[var(--primary)] font-bold flex items-center">
            {t('viewAll')} <ChevronLeft size={14} className="rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
              {t('noData')}
            </div>
          ) : (
            recentActivity.map((activity, index) => {
              const isFuel = activity.type === 'fuel';
              const isMaint = activity.type === 'maintenance';
              const isIncome = activity.type === 'income';
              const isElectricFuel = isFuel && activity.energyType === 'electricity';

              const Icon = isFuel ? Fuel : isMaint ? Wrench : isIncome ? TrendingUp : Wallet;
              const color = isFuel ? (isElectricFuel ? 'text-green-500' : 'text-blue-500') : isMaint ? 'text-yellow-500' : isIncome ? 'text-green-500' : 'text-purple-500';
              const bg = isFuel ? (isElectricFuel ? 'bg-green-500/10' : 'bg-blue-500/10') : isMaint ? 'bg-yellow-500/10' : isIncome ? 'bg-green-500/10' : 'bg-purple-500/10';

              const safeCost = safeNumber(activity.cost);

              return (
                <div
                  key={activity.id || `act-${index}`}
                  className={`flex items-center justify-between p-3 ${index !== recentActivity.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${bg} ${color} flex-shrink-0`}>
                      <Icon size={16} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-xs font-bold text-[var(--text)] truncate">
                        {isFuel ? (isElectricFuel ? t('chargingSession') : t('fuel')) : isMaint ? t('maintenance') : isIncome ? t('income') : t('expense')}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] truncate">
                        {activity.date ? formatDate(activity.date, todayLocale) : t('notSpecified')}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xs sm:text-sm font-bold flex-shrink-0 ml-2 ${isIncome ? 'text-green-500' : 'text-[var(--text)]'}`}>
                    {isIncome ? '+' : ''}{safeCost.toLocaleString()}{' '}
                    <span className="text-[9px] sm:text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
