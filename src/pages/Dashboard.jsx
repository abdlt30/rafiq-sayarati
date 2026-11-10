import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { notificationService } from '../services/notificationService';
import { Link } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  ChevronLeft, Pencil, Check, X, Bell, Settings, AlertTriangle, Activity, ShieldAlert
} from 'lucide-react';

export default function Dashboard() {
  const { currentCar, updateCar, t, currency, user, lang } = useContext(AppContext);

  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [newOdo, setNewOdo] = useState('');

  // ✅ إصلاح الترحيب: إذا لم يكن هناك اسم، نستخدم "مرحباً بك"
  const greeting = user?.name ? `مرحباً، ${user.name} 👋` : 'مرحباً بك 👋';

  const totals = useMemo(() => {
    if (!currentCar) return { fuel: 0, maintenance: 0, expenses: 0, total: 0 };
    return dbService.getTotals(currentCar.id) || { fuel: 0, maintenance: 0, expenses: 0, total: 0 };
  }, [currentCar]);

  const avgConsumption = useMemo(() => {
    if (!currentCar) return 0;
    const fuelRecords = (dbService.getFuel() || []).filter(f => f.carId === currentCar.id);
    if (fuelRecords.length < 2) return 0; 
    
    const sorted = [...fuelRecords].sort((a, b) => Number(a.odometer) - Number(b.odometer));
    let totalLiters = 0;
    let totalDistance = 0;

    for (let i = 1; i < sorted.length; i++) {
        const dist = Number(sorted[i].odometer) - Number(sorted[i-1].odometer);
        if (dist > 0) {
            totalDistance += dist;
            totalLiters += Number(sorted[i].liters);
        }
    }
    if (totalDistance === 0) return 0;
    const result = (totalLiters / totalDistance) * 100;
    return isNaN(result) || !isFinite(result) ? 0 : result.toFixed(1);
  }, [currentCar]);

  // ✅ جلب جميع التنبيهات الهامة (وثائق، صيانة، زيت)
  const criticalAlerts = useMemo(() => {
    if (!currentCar) return [];
    try {
      const alerts = notificationService.generateSmartAlerts(currentCar, t, lang);
      return (alerts || []).filter(a => a.severity === 'critical' || a.severity === 'warning').slice(0, 3); // عرض 3 تنبيهات كحد أقصى
    } catch (e) {
      return [];
    }
  }, [currentCar, t, lang]);

  const recentActivity = useMemo(() => {
    if (!currentCar) return [];
    const fuel = (dbService.getFuel() || []).filter(f => f.carId === currentCar.id).map(f => ({ ...f, type: 'fuel' }));
    const maintenance = (dbService.getMaintenance() || []).filter(m => m.carId === currentCar.id).map(m => ({ ...m, type: 'maintenance' }));
    const expenses = (dbService.getExpenses() || []).filter(e => e.carId === currentCar.id).map(e => ({ ...e, type: 'expense' }));
    
    return [...fuel, ...maintenance, ...expenses]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 4);
  }, [currentCar]);

  if (!currentCar) return null;

  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleSaveOdometer = () => {
    if (newOdo && Number(newOdo) >= 0) {
      updateCar(currentCar.id, { odometer: Number(newOdo) }); 
      setIsEditingOdo(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-2">
      
      {/* الشريط العلوي المثبت */}
      <div className="flex justify-between items-start sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 mb-2 gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-[var(--text)] truncate">
            {greeting}
          </h1>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold truncate">{today}</p>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/notifications" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors relative">
            <Bell size={18} />
            {criticalAlerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--surface)]"></span>}
          </Link>
          <Link to="/settings" className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* بطاقة السيارة الحالية */}
      <div className="bg-gradient-to-br from-blue-900/40 to-[var(--surface)] border border-blue-500/20 p-4 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Car size={100} /></div>
        
        <p className="text-xs text-blue-300 font-bold mb-3">السيارة الحالية</p>
        
        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-16 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
             {currentCar.image ? (
               <img src={currentCar.image} alt="car" className="w-full h-full object-cover" />
             ) : (
               <Car size={28} className="text-white/50" />
             )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">{currentCar.make} {currentCar.model}</h2>
            <p className="text-[11px] sm:text-sm font-mono text-blue-200 mt-1 bg-blue-500/20 px-2 py-0.5 rounded inline-block truncate max-w-full">
              {currentCar.plate || 'بدون لوحة'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 relative z-10">
          <Link to="/vehicles" className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold py-2.5 rounded-xl text-center backdrop-blur-md transition-colors">
            تغيير السيارة
          </Link>
          <Link to="/add-vehicle" className="flex-1 bg-[var(--primary)] hover:bg-blue-600 text-white text-[11px] sm:text-xs font-bold py-2.5 rounded-xl text-center shadow-lg transition-colors">
            إضافة سيارة +
          </Link>
        </div>
      </div>

      {/* ✅ التنبيهات الهامة (تظهر بشكل احترافي) */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          <h3 className="text-xs font-bold text-[var(--text-muted)] px-1 mb-1">تنبيهات تحتاج انتباهك</h3>
          {criticalAlerts.map((alert, idx) => (
            <Link key={idx} to={alert.link} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all hover:scale-[1.01] ${alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]'}`}>
              <div className={`p-2 rounded-xl ${alert.severity === 'critical' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                {alert.severity === 'critical' ? <AlertTriangle size={18} /> : <ShieldAlert size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{alert.title}</p>
                <p className="text-[11px] opacity-80 truncate mt-0.5">{alert.desc}</p>
              </div>
              <ChevronLeft size={16} className="flex-shrink-0 opacity-50" />
            </Link>
          ))}
        </div>
      )}

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link to="/fuel" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 transition-colors">
          <div className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-500 rounded-lg mb-1 sm:mb-2"><Fuel size={18} /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">وقود</span>
        </Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-yellow-500/50 transition-colors">
          <div className="p-1.5 sm:p-2 bg-yellow-500/10 text-yellow-500 rounded-lg mb-1 sm:mb-2"><Wrench size={18} /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">صيانة</span>
        </Link>
        <Link to="/expenses" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-purple-500/50 transition-colors">
          <div className="p-1.5 sm:p-2 bg-purple-500/10 text-purple-500 rounded-lg mb-1 sm:mb-2"><Wallet size={18} /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">مصاريف</span>
        </Link>
        <Link to="/documents" className="flex flex-col items-center justify-center p-2 sm:p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-green-500/50 transition-colors">
          <div className="p-1.5 sm:p-2 bg-green-500/10 text-green-500 rounded-lg mb-1 sm:mb-2"><FileText size={18} /></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text)]">وثائق</span>
        </Link>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">إجمالي المصاريف</p>
          <p className="text-lg sm:text-xl font-extrabold text-[var(--text)] truncate">
            {totals.total.toLocaleString()} <span className="text-[10px] sm:text-xs font-normal">{currency}</span>
          </p>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">عداد السيارة</p>
          {isEditingOdo ? (
            <div className="flex items-center gap-1 mt-1">
              <input 
                type="number" 
                value={newOdo} 
                onChange={(e) => setNewOdo(e.target.value)}
                placeholder={currentCar.odometer || 0}
                className="w-full bg-[var(--surface-2)] border border-[var(--primary)] rounded-md px-1 py-0.5 text-sm font-bold text-[var(--text)] outline-none"
                autoFocus
              />
              <button onClick={handleSaveOdometer} className="text-green-500 p-1 bg-green-500/10 rounded"><Check size={14} /></button>
              <button onClick={() => setIsEditingOdo(false)} className="text-red-500 p-1 bg-red-500/10 rounded"><X size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-lg sm:text-xl font-extrabold text-blue-500 flex items-center gap-1 truncate">
                {Number(currentCar.odometer || 0).toLocaleString()} <span className="text-[10px] sm:text-xs font-normal">KM</span>
              </p>
              <button 
                onClick={() => { setNewOdo(currentCar.odometer || ''); setIsEditingOdo(true); }}
                className="p-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md hover:bg-[var(--primary)]/20 transition-colors flex-shrink-0"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="col-span-2 bg-[var(--surface)] border border-[var(--border)] p-3 sm:p-4 rounded-2xl flex justify-between items-center">
            <div>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold mb-1">متوسط استهلاك الوقود</p>
                <p className="text-lg sm:text-xl font-extrabold text-green-500 flex items-center gap-1">
                    {avgConsumption > 0 ? avgConsumption : '—'} <span className="text-[10px] sm:text-xs font-normal">L/100km</span>
                </p>
            </div>
            <Activity size={28} className="text-green-500/20" />
        </div>
      </div>

      {/* آخر العمليات */}
      <div>
        <div className="flex justify-between items-center mb-3 mt-4">
          <h3 className="font-bold text-[var(--text)] text-sm">آخر العمليات</h3>
          <Link to="/timeline" className="text-xs text-[var(--primary)] font-bold flex items-center">
            عرض الكل <ChevronLeft size={14} />
          </Link>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {recentActivity.length === 0 ? (
             <div className="p-6 text-center text-xs text-[var(--text-muted)]">لا توجد عمليات مسجلة بعد.</div>
          ) : (
            recentActivity.map((activity, index) => {
              const isFuel = activity.type === 'fuel';
              const isMaint = activity.type === 'maintenance';
              const Icon = isFuel ? Fuel : isMaint ? Wrench : Wallet;
              const color = isFuel ? 'text-blue-500' : isMaint ? 'text-yellow-500' : 'text-purple-500';
              const bg = isFuel ? 'bg-blue-500/10' : isMaint ? 'bg-yellow-500/10' : 'bg-purple-500/10';

              return (
                <div key={index} className={`flex items-center justify-between p-3 ${index !== recentActivity.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${bg} ${color} flex-shrink-0`}><Icon size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-xs font-bold text-[var(--text)] truncate">{isFuel ? 'تعبئة وقود' : isMaint ? 'صيانة' : 'مصروف'}</p>
                      <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] truncate">{activity.date || 'غير محدد'}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[var(--text)] flex-shrink-0 ml-2">
                    {Number(activity.cost || 0).toLocaleString()} <span className="text-[9px] sm:text-[10px] font-normal">{currency}</span>
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
