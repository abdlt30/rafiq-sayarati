import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { 
  Wallet, Gauge, Fuel, Wrench, Car, FileText, 
  Bell, Settings, Plus, ArrowLeftRight, AlertCircle, Calendar, ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentCar, currency, t, lang } = useContext(AppContext); 
  const navigate = useNavigate();

  const [data, setData] = useState({
    totalCost: 0, monthlyCost: 0, costPerKm: 0, distance: 0,
    upcomingMaintenance: [], expiringDocs: [], recentActivity: []
  });

  useEffect(() => {
    if (!currentCar) return;

    const fuel = dbService.getFuel().filter(r => r.carId === currentCar.id);
    const expenses = dbService.getExpenses().filter(r => r.carId === currentCar.id);
    const maintenance = dbService.getMaintenance().filter(r => r.carId === currentCar.id);
    const docs = dbService.getDocuments().filter(r => r.carId === currentCar.id);

    const totalFuel = fuel.reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const totalExp = expenses.reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const totalMaint = maintenance.reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const grandTotal = totalFuel + totalExp + totalMaint;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const isThisMonth = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false; 
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const monthFuel = fuel.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const monthExp = expenses.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const monthMaint = maintenance.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const monthlyTotal = monthFuel + monthExp + monthMaint;

    const odometers = fuel.map(r => Number(r.odometer)).filter(o => o > 0).sort((a, b) => a - b);
    let distance = 0;
    if (odometers.length > 1) distance = odometers[odometers.length - 1] - odometers[0];
    else if (odometers.length === 1 && currentCar.currentOdometer) distance = Math.max(0, currentCar.currentOdometer - odometers[0]);
    
    const costPerKm = distance > 0 ? (grandTotal / distance).toFixed(2) : 0;

    const maintAlerts = maintenance
      .filter(m => m.nextKm && Number(m.nextKm) > (currentCar.currentOdometer || 0))
      .sort((a, b) => Number(a.nextKm) - Number(b.nextKm))
      .slice(0, 3);

    const docAlerts = docs
      .filter(d => {
        if (!d.endDate) return false;
        const daysLeft = Math.ceil((new Date(d.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 30; 
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    const allActivities = [
      ...fuel.map(r => ({ ...r, type: 'fuel', icon: Fuel, color: 'text-blue-500' })),
      ...expenses.map(r => ({ ...r, type: 'expense', icon: Wallet, color: 'text-purple-500' })),
      ...maintenance.map(r => ({ ...r, type: 'maintenance', icon: Wrench, color: 'text-yellow-500' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    setData({
      totalCost: grandTotal, monthlyCost: monthlyTotal, costPerKm, distance,
      upcomingMaintenance: maintAlerts, expiringDocs: docAlerts, recentActivity: allActivities
    });

  }, [currentCar]);

  const getFormattedDate = () => {
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Date().toLocaleDateString(localeMap[lang] || 'ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      
      {/* الشريط العلوي (Sticky) */}
      <div className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 flex justify-between items-center border-b border-[var(--border)]/50 shadow-sm">
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

      {/* بطاقة السيارة الحالية - تم تحديثها لعرض الصورة */}
      <div className="hero-card p-5 mt-2 shadow-2xl shadow-blue-500/10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-200/70 mb-1">{t('currentCar') || 'السيارة الحالية'}</p>
            <h3 className="text-2xl font-extrabold text-white tracking-wide">{currentCar?.make} {currentCar?.model}</h3>
            <p className="text-sm font-medium text-blue-100/80 mt-2 bg-black/20 w-fit px-2.5 py-1 rounded-md inline-block">
              {currentCar?.plate || 'بدون لوحة'}
            </p>
            {(currentCar?.year || currentCar?.color) && (
              <p className="text-xs text-blue-200/60 mt-1">
                {currentCar.year && `${currentCar.year}`} {currentCar.year && currentCar.color && ' • '} {currentCar.color && `${currentCar.color}`}
              </p>
            )}
          </div>
          
          {/* عرض صورة السيارة الحقيقية أو الأيقونة */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg flex-shrink-0 ml-4">
            {currentCar?.image ? (
              <img src={currentCar.image} alt="Car" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <Car size={36} className="text-white/60" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
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
        <Link to="/fuel" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] hover:border-blue-500/30 transition-all group">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mb-2 group-hover:scale-110 transition-transform"><Fuel size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('fuel') || 'وقود'}</span>
        </Link>
        <Link to="/expenses" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] hover:border-purple-500/30 transition-all group">
          <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl mb-2 group-hover:scale-110 transition-transform"><Wallet size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('expenses') || 'مصاريف'}</span>
        </Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] hover:border-yellow-500/30 transition-all group">
          <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl mb-2 group-hover:scale-110 transition-transform"><Wrench size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('maintenance') || 'صيانة'}</span>
        </Link>
        <Link to="/documents" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] hover:border-green-500/30 transition-all group">
          <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl mb-2 group-hover:scale-110 transition-transform"><FileText size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('documents') || 'وثائق'}</span>
        </Link>
      </div>

      {/* لوحة البيانات (KPIs) */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full"></div>
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('totalCost') || 'إجمالي المصاريف'}</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-extrabold text-[var(--text)]">{data.totalCost}</span>
            <span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{currency}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full"></div>
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('monthlyCost') || 'مصاريف الشهر'}</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-extrabold text-[var(--text)]">{data.monthlyCost}</span>
            <span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{currency}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-full"></div>
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('costPerKm') || 'تكلفة الكيلومتر'}</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-extrabold text-[var(--text)]">{data.costPerKm}</span>
            <span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">{currency}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full"></div>
          <span className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">{t('distance') || 'المسافة المقطوعة'}</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-extrabold text-[var(--text)]">{data.distance}</span>
            <span className="text-xs font-medium text-[var(--text-muted)] mb-0.5">KM</span>
          </div>
        </div>
      </div>

      {/* التنبيهات */}
      {data.upcomingMaintenance.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <Wrench size={16} className="text-yellow-500"/> {t('upcomingMaintenance') || 'الصيانة القادمة'}
            </h3>
            <Link to="/maintenance" className="text-xs text-[var(--primary)] font-medium">{t('viewAll') || 'عرض الكل'}</Link>
          </div>
          <div className="space-y-2">
            {data.upcomingMaintenance.map(maint => (
              <div key={maint.id} className="flex justify-between items-center bg-[var(--surface-2)] p-3 rounded-xl text-xs">
                <span className="font-bold text-[var(--text)]">{t(maint.type) || maint.type}</span>
                <span className="text-[var(--text-muted)] bg-[var(--surface)] px-2 py-1 rounded-md">عند {maint.nextKm} KM</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.expiringDocs.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500"/> {t('expiringDocs') || 'وثائق تنتهي قريباً'}
            </h3>
            <Link to="/documents" className="text-xs text-[var(--primary)] font-medium">{t('viewAll') || 'عرض الكل'}</Link>
          </div>
          <div className="space-y-2">
            {data.expiringDocs.map(doc => (
              <div key={doc.id} className="flex justify-between items-center bg-[var(--surface-2)] p-3 rounded-xl text-xs">
                <span className="font-bold text-[var(--text)]">{t(doc.type) || doc.type}</span>
                <span className="text-red-400 font-medium bg-red-400/10 px-2 py-1 rounded-md">{doc.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* آخر العمليات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
            <Calendar size={16} className="text-[var(--primary)]"/> {t('recentActivity') || 'آخر العمليات'}
          </h3>
          <Link to="/expenses" className="text-xs text-[var(--primary)] font-medium flex items-center gap-1 hover:underline">
            {t('viewAll') || 'عرض الكل'} <ChevronLeft size={14} className={lang === 'ar' ? '' : 'rotate-180'} />
          </Link>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">{t('noData') || 'لا توجد بيانات'}</p>
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
