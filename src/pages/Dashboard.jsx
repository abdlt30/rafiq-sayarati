import { useContext, useState, useCallback, useMemo } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  ChevronLeft, Pencil, Check, X, Bell, Settings,
  TrendingUp, TrendingDown, Activity, Plus, ShieldCheck, ChevronDown, CheckCircle,
  AlertTriangle, MapPin, Search
} from 'lucide-react'; 

import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';
import { getBrandLogoUrl, findBrandByName } from '../shared/constants/carBrands.js';

// ✅ مكون العداد الدائري (Cockpit Gauge)
const CircularGauge = ({ value, max, label, color, unit, subLabel, icon: Icon }) => {
  const safeMax = max > 0 ? max : 100;
  const safeVal = Math.min(Math.max(0, value), safeMax);
  const percentage = (safeVal / safeMax) * 100;
  
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative w-28 h-28">
      <svg className="transform -rotate-90 w-28 h-28">
        <circle cx="56" cy="56" r={radius} stroke="var(--surface-2)" strokeWidth="8" fill="transparent" />
        <circle 
          cx="56" cy="56" r={radius} 
          stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {Icon && <Icon size={14} className="mb-0.5" style={{ color }} />}
        <span className="text-lg font-extrabold text-[var(--text)]">{value}</span>
        <span className="text-[8px] text-[var(--text-muted)] font-bold">{unit}</span>
      </div>
      <span className="text-[10px] font-bold text-[var(--text)] mt-2 text-center">{label}</span>
      {subLabel && <span className="text-[8px] text-[var(--text-muted)] text-center mt-0.5">{subLabel}</span>}
    </div>
  );
};

// مكون عرض الشعار
const CarBrandLogo = ({ carName, carImage }) => {
  const [imgError, setImgError] = useState(false);
  
  if (carImage && !imgError) {
    return <img src={carImage} alt="car" className="w-full h-full object-cover rounded-xl" onError={() => setImgError(true)} />;
  }

  const brand = findBrandByName(carName);
  const logoUrl = brand ? getBrandLogoUrl(brand.domain) : null;

  if (!logoUrl || imgError) {
    return <Car size={28} className="text-[var(--text-muted)] opacity-50" />;
  }

  return (
    <img 
      src={logoUrl} 
      alt={carName} 
      onError={() => setImgError(true)}
      className="w-full h-full object-contain p-1.5 drop-shadow-md"
    />
  );
};

export default function Dashboard() {
  const { currentCar, updateCar, t, currency, user, lang, totals, recentActivity, vehicles, selectCar, isLoading } = useContext(AppContext);
  const navigate = useNavigate();

  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setSearchQuery('');
  };

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles;
    return vehicles.filter(car => 
      `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (car.plate && car.plate.includes(searchQuery))
    );
  }, [vehicles, searchQuery]);

  const netValue = safeNumber(totals?.net);
  const isNetPositive = netValue >= 0;
  const incomeValue = safeNumber(totals?.income);
  const totalValue = safeNumber(totals?.total);
  const odometerValue = safeNumber(currentCar?.odometer);
  const avgValue = safeNumber(totals?.avgConsumption);
  const avgUnit = currentCar?.powertrain === 'ev' ? 'kWh/100km' : 'L/100km';
  const healthScore = 100; 

  const tankCapacity = safeNumber(currentCar?.tankCapacity) || 50;
  const currentFuelLiters = safeNumber(currentCar?.currentFuel) || (tankCapacity / 2);
  let distanceToEmpty = 0;
  if (avgValue > 0) {
    distanceToEmpty = Math.floor((currentFuelLiters / avgValue) * 100);
  }
  const isFuelLow = distanceToEmpty > 0 && distanceToEmpty < 50;
  const findGasStationUrl = `https://www.google.com/maps/search/${encodeURIComponent('gas station محطة وقود')}`;

  if (isLoading) return <div className="p-4 space-y-4 animate-pulse"><div className="h-40 bg-[var(--surface-2)] rounded-3xl"></div><div className="h-24 bg-[var(--surface-2)] rounded-2xl"></div></div>;
  if (!currentCar) return null;

  return (
    <div className="space-y-5 pb-24 px-4 pt-2 font-sans">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-start sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 mb-2 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-[var(--text)] truncate">{greeting}</h1>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold truncate">{today}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/notifications" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors relative"><Bell size={18} /></Link>
          <Link to="/settings" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"><Settings size={18} /></Link>
        </div>
      </div>

      {/* بطاقة السيارة (أفقية) */}
      <div 
        onClick={() => setIsCarModalOpen(true)}
        className="relative overflow-hidden rounded-2xl p-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm cursor-pointer hover:border-[var(--primary)]/50 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h2 className="text-lg font-extrabold text-[var(--text)] leading-tight truncate">
              {currentCar.make} {currentCar.model}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
              {currentCar.plate || t('noPlate')} • {odometerValue.toLocaleString()} {t('km') || 'كم'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md">
                <ShieldCheck size={12} /> {healthScore}% {t('carHealth') || 'صحة'}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1 bg-[var(--surface-2)] px-2 py-0.5 rounded-md">
                <ChevronDown size={12} /> {t('switchCar') || 'تغيير'}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 bg-[var(--surface-2)] rounded-full flex items-center justify-center overflow-hidden border border-[var(--border)] shrink-0 shadow-inner">
            <CarBrandLogo carName={`${currentCar.make} ${currentCar.model}`} carImage={currentCar.image} />
          </div>
        </div>
      </div>

      {/* ✅ لوحة القيادة (Cockpit) - الجزء الأول: الوقود والصحة */}
      <div className="grid grid-cols-2 gap-3">
        {/* عداد الوقود */}
        <div className={`p-3 rounded-2xl border ${isFuelLow ? 'bg-red-500/5 border-red-500/30' : 'bg-[var(--surface)] border-[var(--border)]'} shadow-sm flex flex-col items-center justify-center relative`}>
          <div className="flex justify-between items-center w-full mb-1 px-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1"><Fuel size={12} className={isFuelLow ? 'text-red-500' : 'text-blue-500'} /> {t('fuelPrediction') || 'الوقود'}</span>
            {isFuelLow && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">تحذير</span>}
          </div>
          <CircularGauge 
            value={distanceToEmpty} 
            max={600} 
            label={t('distanceToEmpty') || 'كم متبقية'} 
            color={isFuelLow ? '#ef4444' : '#3b82f6'} 
            unit={t('km') || 'كم'} 
            icon={MapPin}
          />
          {isFuelLow && (
            <a href={findGasStationUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-[9px] font-bold text-white bg-red-500 px-2 py-1 rounded-md">أقرب محطة</a>
          )}
        </div>

        {/* عداد الصحة + متوسط الاستهلاك (تمت إعادته) */}
        <div className="p-3 rounded-2xl border bg-[var(--surface)] border-[var(--border)] shadow-sm flex flex-col items-center justify-center relative">
          <div className="flex justify-between items-center w-full mb-1 px-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> {t('carHealth') || 'الحالة'}</span>
          </div>
          <CircularGauge 
            value={healthScore} 
            max={100} 
            label={t('carHealth') || 'ممتازة'} 
            color="#10b981" 
            unit="%" 
          />
          <div className="mt-1 w-full bg-[var(--surface-2)] rounded-lg p-1.5 text-center border border-[var(--border)]">
             <p className="text-[8px] text-[var(--text-muted)] font-bold">{t('avgConsumption') || 'متوسط الاستهلاك'}</p>
             <p className="text-[10px] font-extrabold text-yellow-500">{avgValue > 0 ? avgValue : '—'} <span className="text-[7px] font-normal text-[var(--text-muted)]">{avgUnit}</span></p>
          </div>
        </div>
      </div>

      {/* ✅ لوحة القيادة - الجزء الثاني: الملخص المالي */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="font-bold text-xs flex items-center gap-1.5"><Activity size={14} className="text-[var(--primary)]"/> {t('financialSummary') || 'الملخص المالي'}</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <div className="bg-green-500/10 border border-green-500/20 p-2 rounded-xl">
              <p className="text-[9px] text-green-500 font-bold mb-0.5 flex items-center gap-1"><TrendingUp size={10}/> {t('totalIncome')}</p>
              <p className="text-sm font-extrabold text-green-500">{incomeValue.toLocaleString()} <span className="text-[9px] font-normal">{currency}</span></p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl">
              <p className="text-[9px] text-red-500 font-bold mb-0.5 flex items-center gap-1"><TrendingDown size={10}/> {t('totalExpenses')}</p>
              <p className="text-sm font-extrabold text-red-500">{totalValue.toLocaleString()} <span className="text-[9px] font-normal">{currency}</span></p>
            </div>
          </div>
          
          <div className="w-1/2 flex justify-center items-center relative ml-2">
            <CircularGauge 
              value={Math.abs(netValue)} 
              max={Math.max(incomeValue, totalValue, 1000)} 
              label={t('netProfit') || 'صافي الربح'} 
              color={isNetPositive ? '#10b981' : '#ef4444'} 
              unit={currency} 
            />
          </div>
        </div>
      </div>

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        <Link to="/fuel" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 active:scale-95 transition-all"><div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg mb-2"><Fuel size={18}/></div><span className="text-[10px] font-bold">{t('fuel')}</span></Link>
        <Link to="/maintenance" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-yellow-500/50 active:scale-95 transition-all"><div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg mb-2"><Wrench size={18}/></div><span className="text-[10px] font-bold">{t('maintenance')}</span></Link>
        <Link to="/expenses" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-purple-500/50 active:scale-95 transition-all"><div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg mb-2"><Wallet size={18}/></div><span className="text-[10px] font-bold">{t('expenses')}</span></Link>
        <Link to="/documents" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-green-500/50 active:scale-95 transition-all"><div className="p-2 bg-green-500/10 text-green-500 rounded-lg mb-2"><FileText size={18}/></div><span className="text-[10px] font-bold">{t('documents')}</span></Link>
      </div>

      {/* زر الإنقاذ (SOS) */}
      <Link to="/assistance" className="flex items-center justify-center gap-2 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl hover:bg-red-500/20 active:scale-[0.98] transition-all mt-2 shadow-sm">
        <AlertTriangle size={20} className="text-red-500 animate-pulse" />
        <span className="text-sm font-bold text-red-500">{t('emergencySOS') || 'إنقاذ طارئ (SOS) - سيارة معطلة؟'}</span>
      </Link>

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

      {/* النافذة السفلية لتبديل السيارة */}
      {isCarModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-end justify-center backdrop-blur-sm pb-0" onClick={() => setIsCarModalOpen(false)}>
          <div className="bg-[var(--surface)] w-full max-w-md rounded-t-3xl border-t border-[var(--border)] animate-slide-up flex flex-col h-[85vh]" onClick={e => e.stopPropagation()}>
            
            <div className="p-5 border-b border-[var(--border)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-[var(--text)]">{t('vehicles') || 'المركبات'}</h3>
                <button onClick={() => setIsCarModalOpen(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)]"><X size={18}/></button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search size={16} className="text-[var(--text-muted)]" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchCar') || 'ابحث عن سيارة...'}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2.5 pr-10 pl-4 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map(car => (
                  <div 
                    key={car.id} 
                    onClick={() => handleSelectCar(car)}
                    className={`flex items-center justify-between p-4 border-b border-[var(--border)] cursor-pointer transition-all ${String(car.id) === String(currentCar.id) ? 'bg-[var(--primary)]/5' : 'hover:bg-[var(--surface-2)]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className={`font-bold text-sm ${String(car.id) === String(currentCar.id) ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                          {car.make} {car.model}
                        </p>
                        <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{car.plate || t('noPlate')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {String(car.id) === String(currentCar.id) && <CheckCircle className="text-[var(--primary)]" size={18} />}
                      <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        <CarBrandLogo carName={`${car.make} ${car.model}`} carImage={car.image} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[var(--text-muted)] text-sm font-bold">
                  {t('noResults') || 'لا توجد نتائج'}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--border)]">
              <button onClick={() => { setIsCarModalOpen(false); navigate('/add-vehicle'); }} className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[var(--primary)]/20">
                <Plus size={18} /> {t('addNewCar') || 'إضافة سيارة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
