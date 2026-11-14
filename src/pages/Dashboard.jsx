import { useContext, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  ChevronLeft, Pencil, Check, X, Bell, Settings,
  TrendingUp, Activity, Plus, ShieldCheck, ChevronDown, CheckCircle,
  AlertTriangle // ✅ إضافة أيقونة الإنقاذ
} from 'lucide-react'; 

import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';

export default function Dashboard() {
  const { currentCar, updateCar, t, currency, user, lang, totals, recentActivity, vehicles, selectCar, isLoading } = useContext(AppContext);
  const navigate = useNavigate();

  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);

  const greeting = user?.name ? `مرحباً، ${user.name} 👋` : 'مرحباً بك 👋';
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const today = new Date().toLocaleDateString(todayLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleSaveOdometer = useCallback(() => {
    const raw = String(newOdo).trim();
    if (raw === '') return; 
    const val = Number(raw);
    if (!Number.isFinite(val) || val < 0) return;
    if (val < safeNumber(currentCar.odometer) && !window.confirm(t('confirmLowerOdometer') || 'هل أنت متأكد؟')) return;
    try { updateCar(currentCar.id, { odometer: val }); setIsEditingOdo(false); } catch (error) { alert(t('errorSaving') || 'حدث خطأ'); }
  }, [newOdo, currentCar, updateCar, t]);

  const handleSelectCar = (car) => {
    selectCar(car);
    setIsCarModalOpen(false);
  };

  const netValue = safeNumber(totals?.net);
  const isNetPositive = netValue >= 0;
  const incomeValue = safeNumber(totals?.income);
  const totalValue = safeNumber(totals?.total);
  const odometerValue = safeNumber(currentCar?.odometer);
  const avgValue = totals?.avgConsumption || null;
  const avgUnit = currentCar?.powertrain === 'ev' ? 'kWh/100km' : 'L/100km';
  const healthScore = 100; 

  if (isLoading) return <div className="p-4 space-y-4 animate-pulse"><div className="h-40 bg-[var(--surface-2)] rounded-3xl"></div><div className="h-24 bg-[var(--surface-2)] rounded-2xl"></div></div>;
  if (!currentCar) return null;

  return (
    <div className="space-y-5 pb-24 px-4 pt-2">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-start sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 mb-2 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-[var(--text)] truncate">{greeting}</h1>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold truncate">{today}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/notifications" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] relative"><Bell size={18} /></Link>
          <Link to="/settings" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)]"><Settings size={18} /></Link>
        </div>
      </div>

      {/* ✅ بطاقة السيارة (Futuristic Car Card) */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-blue-900/60 via-[var(--surface)] to-[var(--surface)] border border-blue-500/20 shadow-xl">
        <div className="absolute -right-10 -top-10 text-white opacity-5 pointer-events-none"><Car size={180} /></div>

        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="text-[10px] font-bold text-blue-300 tracking-wider uppercase">{t('carDetails') || 'تفاصيل السيارة'}</span>
          <button onClick={() => setIsCarModalOpen(true)} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all active:scale-95">
            {t('switchCar') || 'تبديل'} <ChevronDown size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-4 relative z-10 mb-5">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shrink-0 shadow-inner">
            {currentCar.image ? <img src={currentCar.image} alt="car" className="w-full h-full object-cover" /> : <Car size={36} className="text-white/30" />}
          </div>
          <div className="flex-1 min-w-0">
            {/* ✅ إصلاح: استخدام break-words بدلاً من truncate لعرض الاسم كاملاً */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight break-words">{currentCar.make} {currentCar.model}</h2>
            <p className="text-xs font-mono text-blue-100 mt-1.5 bg-blue-500/30 px-2.5 py-1 rounded-md inline-block truncate max-w-full backdrop-blur-sm border border-blue-400/20">{currentCar.plate || t('noPlate')}</p>
          </div>
        </div>

        {/* مؤشر صحة السيارة */}
        <div className="p-3 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm relative z-10">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-blue-200 font-bold flex items-center gap-1"><ShieldCheck size={12} className="text-green-400" /> {t('carHealth') || 'حالة السيارة'}</span>
            <span className="text-[10px] font-bold text-green-400">{healthScore}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000" style={{ width: `${healthScore}%` }}></div>
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

      {/* ✅ إضافة زر الإنقاذ (SOS) - هذا هو الزر الذي كان مفقوداً */}
      <Link to="/assistance" className="flex items-center justify-center gap-2 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl hover:bg-red-500/20 active:scale-[0.98] transition-all mt-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
        <AlertTriangle size={20} className="text-red-500 animate-pulse" />
        <span className="text-sm font-bold text-red-500">{t('emergencySOS') || 'إنقاذ طارئ (SOS) - سيارة معطلة؟'}</span>
      </Link>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[var(--surface)] border border-green-500/20 p-4 rounded-2xl shadow-sm"><p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalIncome')}</p><p className="text-xl font-extrabold text-green-500 truncate">{incomeValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p></div>
        <div className="bg-[var(--surface)] border border-red-500/20 p-4 rounded-2xl shadow-sm"><p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('totalExpenses')}</p><p className="text-xl font-extrabold text-red-500 truncate">{totalValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p></div>
        <div className={`col-span-2 border p-4 rounded-2xl flex justify-between items-center ${isNetPositive ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30' : 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30'}`}>
          <div><p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('netProfit')}</p><p className={`text-2xl font-extrabold ${isNetPositive ? 'text-green-500' : 'text-red-500'}`}>{netValue.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p></div>
          <TrendingUp size={36} className={isNetPositive ? 'text-green-500/20' : 'text-red-500/20'} />
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('odometer')}</p>
          {isEditingOdo ? (
            <div className="flex items-center gap-1 mt-1"><input type="number" value={newOdo} onChange={(e) => setNewOdo(e.target.value)} className="w-full bg-[var(--surface-2)] border border-[var(--primary)] rounded-md px-1 py-0.5 text-sm font-bold outline-none" autoFocus /><button onClick={handleSaveOdometer} className="text-green-500 p-1 bg-green-500/10 rounded"><Check size={14}/></button><button onClick={() => setIsEditingOdo(false)} className="text-red-500 p-1 bg-red-500/10 rounded"><X size={14}/></button></div>
          ) : (
            <div className="flex items-center justify-between mt-1"><p className="text-lg font-extrabold text-blue-500">{odometerValue.toLocaleString()}</p><button onClick={() => { setNewOdo(String(odometerValue)); setIsEditingOdo(true); }} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md"><Pencil size={14}/></button></div>
          )}
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl"><p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">{t('avgConsumption')}</p><p className="text-lg font-extrabold text-yellow-500 flex items-center gap-1 mt-1">{avgValue !== null ? avgValue : '—'} <span className="text-[10px] font-normal text-[var(--text-muted)]">{avgUnit}</span></p></div>
      </div>

      {/* آخر العمليات */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-sm">{t('recentActivity')}</h3><Link to="/timeline" className="text-xs text-[var(--primary)] font-bold flex items-center">{t('viewAll')} <ChevronLeft size={14} className="rtl:rotate-0 ltr:rotate-180"/></Link></div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center animate-fade-in">
              <div className="w-16 h-16 bg-[var(--surface-2)] rounded-full flex items-center justify-center mb-3"><Activity size={24} className="text-[var(--text-muted)]" /></div>
              <p className="text-sm font-bold text-[var(--text)] mb-2">{t('noData')}</p>
              <Link to="/fuel" className="flex items-center gap-1 text-xs text-white bg-[var(--primary)] px-4 py-2 rounded-lg"><Plus size={14}/> {t('addFuel')}</Link>
            </div>
          ) : (
            recentActivity.map((activity, index) => {
              const isFuel = activity.type === 'fuel'; const isIncome = activity.type === 'income'; const safeCost = safeNumber(activity.cost);
              return (
                <div key={index} className="flex justify-between items-center p-3 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${isFuel ? 'bg-blue-500/10 text-blue-500' : isIncome ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>{isFuel ? <Fuel size={16}/> : isIncome ? <TrendingUp size={16}/> : <Wallet size={16}/>}</div><div><p className="text-xs font-bold">{isFuel ? t('fuel') : isIncome ? t('income') : t('expense')}</p><p className="text-[10px] text-[var(--text-muted)]">{formatDate(activity.date, todayLocale)}</p></div></div>
                  <p className={`text-xs font-bold ${isIncome ? 'text-green-500' : 'text-[var(--text)]'}`}>{isIncome ? '+' : ''}{safeCost} {currency}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ✅ النافذة السفلية لتبديل السيارة (Bottom Sheet) */}
      {isCarModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-end justify-center backdrop-blur-sm pb-0" onClick={() => setIsCarModalOpen(false)}>
          <div className="bg-[var(--surface)] w-full max-w-md rounded-t-3xl p-5 border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[var(--text)]">{t('switchCar') || 'تبديل السيارة'}</h3>
              <button onClick={() => setIsCarModalOpen(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full"><X size={18}/></button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pb-4">
              {vehicles.map(car => (
                <div 
                  key={car.id} 
                  onClick={() => handleSelectCar(car)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${String(car.id) === String(currentCar.id) ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--text-muted)]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0">
                      {car.image ? <img src={car.image} className="w-full h-full object-cover" /> : <Car size={20} className="text-[var(--text-muted)]"/>}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--text)] truncate max-w-[150px]">{car.make} {car.model}</p>
                      <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{car.plate || t('noPlate')}</p>
                    </div>
                  </div>
                  {String(car.id) === String(currentCar.id) && <CheckCircle className="text-[var(--primary)]" size={20} />}
                </div>
              ))}
            </div>

            <button onClick={() => { setIsCarModalOpen(false); navigate('/add-vehicle'); }} className="w-full mt-2 bg-[var(--surface-2)] border border-dashed border-[var(--border)] text-[var(--text)] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
              <Plus size={18} /> {t('addNewCar')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
