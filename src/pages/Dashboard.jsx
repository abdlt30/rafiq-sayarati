import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { 
  Wallet, Gauge, Fuel, Wrench, Car, FileText, 
  Bell, Settings, Plus, ArrowLeftRight, AlertCircle, Calendar, ChevronLeft, Sparkles, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentCar, currency, t, lang } = useContext(AppContext); 
  const navigate = useNavigate();

  const [data, setData] = useState({
    totalCost: 0, monthlyCost: 0, costPerKm: 0, distance: 0,
    upcomingReminders: [], recentActivity: []
  });

  useEffect(() => {
    if (!currentCar) return;

    const fuel = dbService.getFuel().filter(r => r.carId === currentCar.id);
    const expenses = dbService.getExpenses().filter(r => r.carId === currentCar.id);
    const maintenance = dbService.getMaintenance().filter(r => r.carId === currentCar.id);
    const docs = dbService.getDocuments().filter(r => r.carId === currentCar.id);
    const reminders = dbService.getReminders().filter(r => r.carId === currentCar.id);

    // حساب التكاليف
    const totalFuel = fuel.reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const totalExp = expenses.reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const totalMaint = maintenance.reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const grandTotal = totalFuel + totalExp + totalMaint;

    const now = new Date();
    const isThisMonth = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const monthTotal = 
      fuel.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost || 0), 0) +
      expenses.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost || 0), 0) +
      maintenance.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost || 0), 0);

    // حساب المسافة
    const odometers = fuel.map(r => Number(r.odometer)).filter(o => o > 0).sort((a, b) => a - b);
    let distance = 0;
    if (odometers.length > 1) distance = odometers[odometers.length - 1] - odometers[0];
    else if (odometers.length === 1 && currentCar.currentOdometer) distance = Math.max(0, currentCar.currentOdometer - odometers[0]);
    
    const costPerKm = distance > 0 ? (grandTotal / distance).toFixed(2) : 0;

    // جمع التذكيرات (صيانة + وثائق + تذكيرات مخصصة) وترتيبها حسب الأقرب
    const allReminders = [
      ...maintenance.filter(m => m.nextKm).map(m => ({ ...m, alertType: 'maintenance', alertText: m.type, value: Number(m.nextKm), isKm: true })),
      ...docs.filter(d => d.endDate).map(d => ({ ...d, alertType: 'document', alertText: d.type, value: new Date(d.endDate), isKm: false })),
      ...reminders.map(r => ({ ...r, alertType: 'reminder', alertText: r.type, value: r.odometer || new Date(r.date), isKm: !!r.odometer }))
    ];
    // فلترة التذكيرات المستقبلية فقط وترتيبها (هذا مجرد ترتيب تقريبي للعرض)
    const upcoming = allReminders.filter(r => {
        if (r.isKm) return r.value > (currentCar.currentOdometer || 0);
        return r.value > new Date();
    }).slice(0, 2); // جلب أقرب تذكيرين

    // آخر العمليات
    const allActivities = [
      ...fuel.map(r => ({ ...r, type: 'fuel', icon: Fuel, color: 'text-blue-500' })),
      ...expenses.map(r => ({ ...r, type: 'expense', icon: Wallet, color: 'text-purple-500' })),
      ...maintenance.map(r => ({ ...r, type: 'maintenance', icon: Wrench, color: 'text-yellow-500' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    setData({
      totalCost: grandTotal, monthlyCost: monthTotal, costPerKm, distance,
      upcomingReminders: upcoming, recentActivity: allActivities
    });

  }, [currentCar]);

  const getFormattedDate = () => {
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Date().toLocaleDateString(localeMap[lang] || 'ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const isEmptyState = data.totalCost === 0 && data.distance === 0 && data.recentActivity.length === 0;

  return (
    <div className="space-y-4 pb-24 px-4">
      
      {/* الشريط العلوي */}
      <div className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 flex justify-between items-center border-b border-[var(--border)]/50 transition-all">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">{t('welcome') || 'مرحباً،'} 👋</h2>
          <p className="text-xs text-[var(--text-muted)]">{getFormattedDate()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/reminders')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] relative hover:text-[var(--primary)] transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg)]"></span>
          </button>
          <button onClick={() => navigate('/settings')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* بطاقة السيارة */}
      <div className="hero-card p-5 mt-2 shadow-2xl shadow-blue-500/10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-blue-200/70 mb-1">{t('currentCar') || 'السيارة الحالية'}</p>
            <h3 className="text-2xl font-extrabold text-white tracking-wide">{currentCar?.make} {currentCar?.model}</h3>
            <p className="text-sm font-medium text-blue-100/80 mt-1 bg-black/20 w-fit px-2 py-0.5 rounded-md">{currentCar?.plate}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg flex-shrink-0 ml-4">
            {currentCar?.image ? (
              <img src={currentCar.image} alt="Car" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <Car size={32} className="text-white/60" />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => navigate('/vehicles')} className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all">
            <ArrowLeftRight size={16} /> {t('switchCar') || 'تغيير'}
          </button>
          <button onClick={() => navigate('/add-vehicle')} className="flex-1 bg-[var(--primary)] hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/30">
            <Plus size={16} /> {t('addNewCar') || 'إضافة'}
          </button>
        </div>
      </div>

      {/* إجراءات سريعة */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* نفس الأزرار السابقة */}
        <Link to="/fuel" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-all"><div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mb-2"><Fuel size={20} /></div><span className="text-[10px] font-bold text-[var(--text-muted)]">{t('fuel') || 'وقود'}</span></Link>
        <Link to="/expenses" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-all"><div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl mb-2"><Wallet size={20} /></div><span className="text-[10px] font-bold text-[var(--text-muted)]">{t('expenses') || 'مصاريف'}</span></Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-all"><div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl mb-2"><Wrench size={20} /></div><span className="text-[10px] font-bold text-[var(--text-muted)]">{t('maintenance') || 'صيانة'}</span></Link>
        <Link to="/documents" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-all"><div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl mb-2"><FileText size={20} /></div><span className="text-[10px] font-bold text-[var(--text-muted)]">{t('documents') || 'وثائق'}</span></Link>
      </div>

      {/* لوحة البيانات (KPIs) */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('totalCost') || 'إجمالي المصاريف'}</span>
          <div className="flex items-end gap-1"><span className="text-xl font-extrabold text-[var(--text)]">{data.totalCost}</span><span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{currency}</span></div>
        </div>
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('monthlyCost') || 'مصاريف الشهر'}</span>
          <div className="flex items-end gap-1"><span className="text-xl font-extrabold text-[var(--text)]">{data.monthlyCost}</span><span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{currency}</span></div>
        </div>
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('costPerKm') || 'تكلفة الكيلومتر'}</span>
          <div className="flex items-end gap-1"><span className="text-xl font-extrabold text-[var(--text)]">{data.costPerKm}</span><span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{currency}</span></div>
        </div>
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('distance') || 'المسافة المقطوعة'}</span>
          <div className="flex items-end gap-1"><span className="text-xl font-extrabold text-[var(--text)]">{data.distance}</span><span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">KM</span></div>
        </div>
      </div>

      {/* التذكيرات الذكية (جديد) */}
      {data.upcomingReminders.length > 0 && (
        <div className="bg-[var(--surface)] border border-red-500/30 rounded-2xl p-4 mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500"/> {t('upcomingAlerts') || 'تنبيهات هامة'}
            </h3>
            <Link to="/reminders" className="text-xs text-[var(--primary)] font-medium">{t('viewAll') || 'عرض الكل'}</Link>
          </div>
          <div className="space-y-2">
            {data.upcomingReminders.map((rem, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[var(--surface-2)] p-3 rounded-xl text-xs">
                <span className="font-bold text-[var(--text)]">{t(rem.alertText) || rem.alertText}</span>
                <span className="text-red-400 font-medium bg-red-400/10 px-2 py-1 rounded-md">
                  {rem.isKm ? `${rem.value} KM` : new Date(rem.value).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الحالة الصفرية / آخر العمليات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
            <Calendar size={16} className="text-[var(--primary)]"/> {t('recentActivity') || 'آخر العمليات'}
          </h3>
          {!isEmptyState && (
             <Link to="/expenses" className="text-xs text-[var(--primary)] font-medium flex items-center gap-1 hover:underline">
               {t('viewAll') || 'عرض الكل'} <ChevronLeft size={14} className={lang === 'ar' ? '' : 'rotate-180'} />
             </Link>
          )}
        </div>
        
        {isEmptyState ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full mb-3">
              <Sparkles size={28} />
            </div>
            <p className="text-sm font-bold text-[var(--text)] mb-1">ابدأ رحلتك!</p>
            <p className="text-xs text-[var(--text-muted)] max-w-[250px]">قم بإضافة أول تعبئة وقود أو مصروف لترى إحصائياتك هنا.</p>
            <Link to="/fuel" className="mt-4 bg-[var(--primary)] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors">
              إضافة وقود
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-[var(--border)] last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-[var(--surface-2)] ${act.color}`}>
                    <act.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text)]">{t(act.type) || act.type}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{act.date}</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-[var(--text)]">{act.cost} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
