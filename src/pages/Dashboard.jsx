import { useContext, useState, useCallback, useMemo } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  ChevronLeft, X, Bell, Settings,
  TrendingUp, TrendingDown, Activity, Plus, ShieldCheck, ChevronDown, CheckCircle,
  AlertTriangle, MapPin, Search, Gauge, AlertOctagon, Navigation, Droplets, Lightbulb,
  Calendar // ✅ تم إضافة أيقونة التقويم
} from 'lucide-react'; 

import { safeNumber } from '../shared/utils/safeNumber.js';
import { formatDate } from '../shared/utils/formatters.js';
import { getBrandLogoUrl, findBrandByName } from '../shared/constants/carBrands.js';

// مكون العداد الدائري (بخطوط كبيرة وواضحة)
const CircularGauge = ({ value, max, label, color, unit, subLabel, icon: Icon }) => {
  const safeMax = max > 0 ? max : 100;
  const displayVal = (value !== null && value !== undefined) ? value : 0;
  const safeVal = Math.min(Math.max(0, displayVal), safeMax);
  const percentage = (safeVal / safeMax) * 100;
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-full max-w-[110px] aspect-square flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          <circle cx="50" cy="50" r={radius} stroke="var(--surface-2)" strokeWidth="8" fill="transparent" />
          <circle 
            cx="50" cy="50" r={radius} 
            stroke={color} strokeWidth="8" fill="transparent"
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          {Icon && <Icon size={16} className="mb-1 opacity-80" style={{ color }} />}
          <span className="text-xl sm:text-2xl font-extrabold text-[var(--text)] leading-tight">{displayVal}</span>
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-bold">{unit}</span>
        </div>
      </div>
      <div className="text-center mt-2 w-full px-1">
        <span className="text-xs sm:text-sm font-bold text-[var(--text)] block truncate">{label}</span>
        {subLabel && <span className="text-[10px] text-[var(--text-muted)] block truncate">{subLabel}</span>}
      </div>
    </div>
  );
};

const CarBrandLogo = ({ carName, carImage }) => {
  const [imgError, setImgError] = useState(false);
  if (carImage && !imgError) return <img src={carImage} alt="car" className="w-full h-full object-cover rounded-xl" onError={() => setImgError(true)} />;
  const brand = findBrandByName(carName);
  const logoUrl = brand ? getBrandLogoUrl(brand.domain) : null;
  if (!logoUrl || imgError) return <Car size={28} className="text-[var(--text-muted)] opacity-50" />;
  return <img src={logoUrl} alt={carName} onError={() => setImgError(true)} className="w-full h-full object-contain p-1.5 drop-shadow-md" />;
};

export default function Dashboard() {
  const { currentCar, updateCar, t, currency, user, lang, totals, recentActivity, vehicles, selectCar, isLoading, notifications } = useContext(AppContext);
  const navigate = useNavigate();

  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

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

  const handleLocateCar = (e) => {
    e.stopPropagation(); 
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank', 'noopener,noreferrer');
          setIsLocating(false);
        },
        () => { alert('تعذر جلب الموقع. يرجى تفعيل الـ GPS.'); setIsLocating(false); },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('متصفحك لا يدعم تحديد الموقع.'); setIsLocating(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles;
    return vehicles.filter(car => 
      `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (car.plate && car.plate.includes(searchQuery))
    );
  }, [vehicles, searchQuery]);

  // --- الحسابات الحقيقية (تعتمد كلياً على AppContext) ---
  const netValue = safeNumber(totals?.net);
  const isNetPositive = netValue >= 0;
  const incomeValue = safeNumber(totals?.income);
  const totalValue = safeNumber(totals?.total);
  const odometerValue = safeNumber(currentCar?.odometer);
  
  // القيم القادمة من الدماغ المركزي
  const avgValue = safeNumber(totals?.avgConsumption); // قد تكون null
  const distanceToEmpty = totals?.distanceToEmpty; // قد تكون null
  const realCostPerKm = totals?.costPerKm; // قد تكون null
  const dailyAverage = safeNumber(totals?.dailyAverage);

  const avgUnit = currentCar?.powertrain === 'ev' ? 'kWh/100km' : 'L/100km';
  
  // حسابات الزيت
  const nextOilChangeOdo = totals?.nextOilChangeOdo;
  const kmToOilChange = (nextOilChangeOdo !== null && odometerValue > 0) 
    ? Math.max(0, nextOilChangeOdo - odometerValue) 
    : null;
  const isOilOverdue = nextOilChangeOdo !== null && odometerValue >= nextOilChangeOdo;

  // ✅ حسابات الإطارات الجديدة
  const nextTireChangeOdo = totals?.nextTireChangeOdo;
  const kmToTireChange = (nextTireChangeOdo !== null && odometerValue > 0) 
    ? Math.max(0, nextTireChangeOdo - odometerValue) 
    : null;
  const isTireOverdue = nextTireChangeOdo !== null && odometerValue >= nextTireChangeOdo;

  // التنبيهات
  const activeAlert = useMemo(() => {
    if (!notifications || notifications.length === 0) return null;
    const primaryAlert = notifications.find(n => n.isUrgent) || notifications[0];
    return { message: `⚠️ ${primaryAlert.title}: ${primaryAlert.message}`, isUrgent: primaryAlert.isUrgent };
  }, [notifications]);

  // حساب صحة السيارة
  let healthScore = 100;
  if (notifications && notifications.length > 0) {
    const urgentCount = notifications.filter(n => n.isUrgent).length;
    const normalCount = notifications.length - urgentCount;
    healthScore -= (urgentCount * 20) + (normalCount * 5);
  }
  if (isOilOverdue) healthScore -= 30;
  if (isTireOverdue) healthScore -= 20; // خصم إضافي إذا كانت الإطارات متأخرة
  else if (kmToOilChange !== null && kmToOilChange < 500) healthScore -= 10;
  healthScore = Math.max(0, healthScore);

  const isFuelLow = distanceToEmpty !== null && distanceToEmpty <= 50;
  const findGasStationUrl = `https://www.google.com/maps/search/${encodeURIComponent('gas station محطة وقود')}`;

  if (isLoading) return <div className="p-4 space-y-4 animate-pulse"><div className="h-40 bg-[var(--surface-2)] rounded-3xl"></div></div>;
  if (!currentCar) return null;

  return (
    <div className="space-y-4 pb-24 px-4 pt-2 font-sans overflow-x-hidden">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-start sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-[var(--text)] truncate">{greeting}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-bold truncate">{today}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/notifications" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors relative"><Bell size={20} /></Link>
          <Link to="/settings" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"><Settings size={20} /></Link>
        </div>
      </div>

      {/* التنبيهات الذكية */}
      {activeAlert && (
        <Link to="/notifications" className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm border block ${activeAlert.isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
          <AlertOctagon size={24} className={`shrink-0 ${activeAlert.isUrgent ? 'text-red-500' : 'text-orange-500'}`} />
          <p className={`text-sm font-bold flex-1 ${activeAlert.isUrgent ? 'text-red-500' : 'text-orange-500'}`}>{activeAlert.message}</p>
          <span className="text-xs font-bold bg-[var(--surface)] px-2.5 py-1.5 rounded-md border border-[var(--border)] text-[var(--text)]">عرض</span>
        </Link>
      )}

      {/* بطاقة السيارة */}
      <div 
        onClick={() => setIsCarModalOpen(true)}
        className="relative overflow-hidden rounded-2xl p-4 bg-[var(--surface)] border border-[var(--border)] shadow-sm cursor-pointer hover:border-[var(--primary)]/50 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text)] leading-tight truncate">
              {currentCar.make} {currentCar.model}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 truncate">
              {currentCar.plate || t('noPlate')} • {odometerValue.toLocaleString()} {t('km') || 'كم'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-md ${healthScore >= 90 ? 'text-green-500 bg-green-500/10' : healthScore >= 70 ? 'text-orange-500 bg-orange-500/10' : 'text-red-500 bg-red-500/10'}`}>
                <ShieldCheck size={14} /> {healthScore}% {t('carHealth') || 'صحة'}
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1 bg-[var(--surface-2)] px-2 py-1 rounded-md">
                <ChevronDown size={14} /> {t('switchCar') || 'تغيير'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-14 h-14 bg-[var(--surface-2)] rounded-full flex items-center justify-center overflow-hidden border border-[var(--border)] shadow-inner">
              <CarBrandLogo carName={`${currentCar.make} ${currentCar.model}`} carImage={currentCar.image} />
            </div>
            <button onClick={handleLocateCar} className="flex items-center gap-1 text-[11px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1.5 rounded-md active:scale-95 transition-all">
              {isLocating ? <Activity size={12} className="animate-spin" /> : <Navigation size={12} />} 
              {isLocating ? 'جاري...' : 'موقعي'}
            </button>
          </div>
        </div>
      </div>

      {/* لوحة القيادة - عدادات */}
      <div className="grid grid-cols-2 gap-3">
        {/* عداد الوقود */}
        <div className={`p-4 rounded-2xl border ${isFuelLow ? 'bg-red-500/5 border-red-500/30' : 'bg-[var(--surface)] border-[var(--border)]'} shadow-sm flex flex-col items-center justify-between relative`}>
          <div className="flex justify-between items-center w-full mb-2 px-1">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1"><Fuel size={14} className={isFuelLow ? 'text-red-500' : 'text-blue-500'} /> {t('fuelPrediction') || 'الوقود'}</span>
          </div>
          
          {distanceToEmpty !== null && distanceToEmpty !== undefined ? (
            <CircularGauge 
              value={distanceToEmpty} max={600} label={t('distanceToEmpty') || 'كم متبقية'} 
              color={isFuelLow ? '#ef4444' : '#3b82f6'} unit={t('km') || 'كم'} icon={MapPin}
            />
          ) : avgValue > 0 ? (
            <CircularGauge value={avgValue} max={20} label={t('avgConsumption') || 'متوسط الاستهلاك'} color="#eab308" unit={avgUnit} icon={Fuel} />
          ) : (
             <div className="flex flex-col items-center justify-center h-[110px] text-center px-2">
               <Fuel size={28} className="text-[var(--text-muted)] opacity-30 mb-2" />
               <span className="text-xs font-bold text-[var(--text-muted)]">أضف تعبئتين لحساب التوقع</span>
             </div>
          )}
          
          <Link to="/fuel" className="mt-3 w-full flex items-center justify-center gap-1 bg-blue-500 text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-transform shadow-md shadow-blue-500/20">
            <Plus size={14} /> تعبئة
          </Link>
        </div>

        {/* ✅ عداد الصحة + التنبؤ (الزيت والإطارات) */}
        <div className="p-4 rounded-2xl border bg-[var(--surface)] border-[var(--border)] shadow-sm flex flex-col items-center justify-between relative">
          <div className="flex justify-between items-center w-full mb-2 px-1">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1"><ShieldCheck size={14} className="text-green-500" /> {t('carHealth') || 'الحالة'}</span>
          </div>
          <CircularGauge 
            value={healthScore} max={100} label={t('carHealth') || 'ممتازة'} 
            color={healthScore >= 90 ? "#10b981" : healthScore >= 70 ? "#f59e0b" : "#ef4444"} unit="%" 
          />
          
          <div className="w-full flex flex-col gap-1.5 mt-3">
             {/* الزيت */}
             <div className={`w-full rounded-lg p-2 text-center border ${isOilOverdue ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--surface-2)] border-[var(--border)]'}`}>
                <p className={`text-[10px] font-bold flex items-center justify-center gap-1 ${isOilOverdue ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                  <Droplets size={12} className={isOilOverdue ? 'text-red-500' : 'text-yellow-500'}/> {t('oilChange') || 'تغيير الزيت'}
                </p>
                {kmToOilChange !== null ? (
                  <div className="flex flex-col items-center mt-0.5">
                    <p className={`text-xs font-extrabold ${isOilOverdue ? 'text-red-500' : 'text-yellow-500'}`}>
                      {isOilOverdue ? 'متأخر!' : `بعد ${kmToOilChange} كم`}
                    </p>
                    {isOilOverdue && (
                      <Link to="/assistance" className="mt-1 text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-md font-bold">
                        أبحث عن ورشة
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">{t('notRegistered') || 'غير مسجل'}</p>
                )}
             </div>

             {/* الإطارات */}
             <div className={`w-full rounded-lg p-2 text-center border ${isTireOverdue ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--surface-2)] border-[var(--border)]'}`}>
                <p className={`text-[10px] font-bold flex items-center justify-center gap-1 ${isTireOverdue ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                  <span className="text-[12px]">🛞</span> {t('tires') || 'الإطارات'}
                </p>
                {kmToTireChange !== null ? (
                  <div className="flex flex-col items-center mt-0.5">
                    <p className={`text-xs font-extrabold ${isTireOverdue ? 'text-red-500' : 'text-blue-500'}`}>
                      {isTireOverdue ? 'متأخر!' : `بعد ${kmToTireChange} كم`}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">{t('notRegistered') || 'غير مسجل'}</p>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* الملخص المالي */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm mt-3">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-sm flex items-center gap-1.5"><Activity size={16} className="text-[var(--primary)]"/> {t('financialSummary') || 'الملخص المالي'}</h3>
          <span className="text-[11px] font-bold text-[var(--text)] bg-[var(--surface-2)] px-2 py-1.5 rounded-md border border-[var(--border)] flex items-center gap-1">
            <Gauge size={12} className="text-purple-400"/> 
            {realCostPerKm !== null 
              ? `تكلفة الكم: ${realCostPerKm} ${currency}` 
              : 'سجل تعبئتين لحساب التكلفة'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-[45%] flex justify-center">
            <CircularGauge 
              value={Math.abs(netValue)} max={Math.max(incomeValue, totalValue, 1000)} 
              label={t('netProfit') || 'صافي الربح'} 
              color={isNetPositive ? '#10b981' : '#ef4444'} unit={currency} 
            />
          </div>
          
          <div className="w-[55%] flex flex-col gap-2">
            <div className="bg-green-500/10 border border-green-500/20 p-2.5 rounded-xl">
              <p className="text-[11px] text-green-500 font-bold mb-1 flex items-center gap-1"><TrendingUp size={12}/> {t('totalIncome')}</p>
              <p className="text-sm font-extrabold text-green-500 truncate">{incomeValue.toLocaleString()} <span className="text-[10px] font-normal">{currency}</span></p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
              <p className="text-[11px] text-red-500 font-bold mb-1 flex items-center gap-1"><TrendingDown size={12}/> {t('totalExpenses')}</p>
              <p className="text-sm font-extrabold text-red-500 truncate">{totalValue.toLocaleString()} <span className="text-[10px] font-normal">{currency}</span></p>
            </div>
          </div>
        </div>

        {/* ✅ إضافة متوسط التكلفة اليومية */}
        <div className="mt-3 pt-3 border-t border-[var(--border)]/50 flex justify-between items-center">
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Calendar size={14} className="text-blue-500 shrink-0" />
            {t('dailyAvgCost') || 'متوسط التكلفة اليومية:'}
          </p>
          <span className="text-sm font-extrabold text-blue-500">
            {dailyAverage > 0 ? `${dailyAverage} ${currency}` : '—'}
          </span>
        </div>

        {/* ✅ إضافة السطر التوضيحي للشفافية المالية */}
        {realCostPerKm !== null && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]/50">
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] text-center leading-relaxed flex items-center justify-center gap-1.5">
              <Lightbulb size={14} className="text-yellow-500 shrink-0" />
              {t('costPerKmExplanation') || 'تكلفة الكم تشمل التأمين والضرائب (تكاليف ثابتة). ستقل مع زيادة المسافة المقطوعة.'}
            </p>
          </div>
        )}
      </div>

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        <Link to="/fuel" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 active:scale-95 transition-all"><div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg mb-2"><Fuel size={20}/></div><span className="text-[11px] sm:text-xs font-bold text-center">{t('fuel')}</span></Link>
        <Link to="/maintenance" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-yellow-500/50 active:scale-95 transition-all"><div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg mb-2"><Wrench size={20}/></div><span className="text-[11px] sm:text-xs font-bold text-center">{t('maintenance')}</span></Link>
        <Link to="/expenses" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-purple-500/50 active:scale-95 transition-all"><div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg mb-2"><Wallet size={20}/></div><span className="text-[11px] sm:text-xs font-bold text-center">{t('expenses')}</span></Link>
        <Link to="/documents" className="flex flex-col items-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-green-500/50 active:scale-95 transition-all"><div className="p-2 bg-green-500/10 text-green-500 rounded-lg mb-2"><FileText size={20}/></div><span className="text-[11px] sm:text-xs font-bold text-center">{t('documents')}</span></Link>
      </div>

      {/* زر الإنقاذ (SOS) */}
      <Link to="/assistance" className="flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl hover:bg-red-500/20 active:scale-[0.98] transition-all mt-2 shadow-sm">
        <AlertTriangle size={22} className="text-red-500 animate-pulse shrink-0" />
        <span className="text-sm font-bold text-red-500 text-center">{t('emergencySOS') || 'إنقاذ طارئ (SOS) - سيارة معطلة؟'}</span>
      </Link>

      {/* آخر العمليات */}
      <div className="mt-5">
        <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-sm">{t('recentActivity')}</h3><Link to="/timeline" className="text-xs text-[var(--primary)] font-bold flex items-center">{t('viewAll')} <ChevronLeft size={16} className="rtl:rotate-0 ltr:rotate-180"/></Link></div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center animate-fade-in">
              <div className="w-16 h-16 bg-[var(--surface-2)] rounded-full flex items-center justify-center mb-3"><Activity size={28} className="text-[var(--text-muted)]" /></div>
              <p className="text-sm font-bold text-[var(--text)] mb-3">{t('noData')}</p>
              <Link to="/fuel" className="flex items-center gap-1 text-xs text-white bg-[var(--primary)] px-4 py-2 rounded-lg"><Plus size={16}/> {t('addFuel')}</Link>
            </div>
          ) : (
            recentActivity.map((activity, index) => {
              const isFuel = activity.type === 'fuel'; const isIncome = activity.type === 'income'; const safeCost = safeNumber(activity.cost);
              return (
                <div key={index} className="flex justify-between items-center p-3.5 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3 min-w-0"><div className={`p-2 rounded-lg shrink-0 ${isFuel ? 'bg-blue-500/10 text-blue-500' : isIncome ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>{isFuel ? <Fuel size={18}/> : isIncome ? <TrendingUp size={18}/> : <Wallet size={18}/>}</div><div className="min-w-0"><p className="text-sm font-bold truncate">{isFuel ? t('fuel') : isIncome ? t('income') : t('expense')}</p><p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(activity.date, todayLocale)}</p></div></div>
                  <p className={`text-sm font-bold shrink-0 ${isIncome ? 'text-green-500' : 'text-[var(--text)]'}`}>{isIncome ? '+' : ''}{safeCost} {currency}</p>
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
                <button onClick={() => setIsCarModalOpen(false)} className="p-2 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)]"><X size={20}/></button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><Search size={18} className="text-[var(--text-muted)]" /></div>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('searchCar') || 'ابحث عن سيارة...'} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-3 pr-10 pl-4 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors" />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map(car => (
                  <div key={car.id} onClick={() => handleSelectCar(car)} className={`flex items-center justify-between p-4 border-b border-[var(--border)] cursor-pointer transition-all ${String(car.id) === String(currentCar.id) ? 'bg-[var(--primary)]/5' : 'hover:bg-[var(--surface-2)]'}`}>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className={`font-bold text-sm ${String(car.id) === String(currentCar.id) ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>{car.make} {car.model}</p>
                        <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">{car.plate || t('noPlate')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {String(car.id) === String(currentCar.id) && <CheckCircle className="text-[var(--primary)]" size={20} />}
                      <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        <CarBrandLogo carName={`${car.make} ${car.model}`} carImage={car.image} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[var(--text-muted)] text-sm font-bold">{t('noResults') || 'لا توجد نتائج'}</div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border)]">
              <button onClick={() => { setIsCarModalOpen(false); navigate('/add-vehicle'); }} className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[var(--primary)]/20 text-sm">
                <Plus size={20} /> {t('addNewCar') || 'إضافة سيارة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
