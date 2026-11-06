import { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { 
  Wallet, Gauge, Fuel, Wrench, Car, FileText, 
  Bell, Settings, Plus, ArrowLeftRight, AlertCircle, Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentCar, currency, t, lang } = useContext(AppContext); 
  const navigate = useNavigate();

  // --- 1. جلب البيانات وحساب الإحصائيات ---
  const [data, setData] = useState({
    totalCost: 0,
    monthlyCost: 0,
    costPerKm: 0,
    distance: 0,
    upcomingMaintenance: [],
    expiringDocs: [],
    recentActivity: []
  });

  useEffect(() => {
    if (!currentCar) return;

    // جلب كل السجلات
    const fuel = dbService.getFuel().filter(r => r.carId === currentCar.id);
    const expenses = dbService.getExpenses().filter(r => r.carId === currentCar.id);
    const maintenance = dbService.getMaintenance().filter(r => r.carId === currentCar.id);
    const docs = dbService.getDocuments().filter(r => r.carId === currentCar.id);

    // 1. حساب التكاليف
    const totalFuel = fuel.reduce((sum, r) => sum + Number(r.cost), 0);
    const totalExp = expenses.reduce((sum, r) => sum + Number(r.cost), 0);
    const totalMaint = maintenance.reduce((sum, r) => sum + Number(r.cost), 0);
    const grandTotal = totalFuel + totalExp + totalMaint;

    // 2. حساب مصاريف الشهر الحالي
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const isThisMonth = (dateStr) => {
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const monthFuel = fuel.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost), 0);
    const monthExp = expenses.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost), 0);
    const monthMaint = maintenance.filter(r => isThisMonth(r.date)).reduce((sum, r) => sum + Number(r.cost), 0);
    const monthlyTotal = monthFuel + monthExp + monthMaint;

    // 3. حساب المسافة وتكلفة الكيلومتر
    const odometers = fuel.map(r => Number(r.odometer)).filter(o => o > 0).sort((a, b) => a - b);
    let distance = 0;
    if (odometers.length > 1) distance = odometers[odometers.length - 1] - odometers[0];
    else if (odometers.length === 1 && currentCar.currentOdometer) distance = Math.max(0, currentCar.currentOdometer - odometers[0]);
    
    const costPerKm = distance > 0 ? (grandTotal / distance).toFixed(2) : 0;

    // 4. تنبيهات الصيانة (أقرب 3)
    const maintAlerts = maintenance
      .filter(m => m.nextKm && m.nextKm > currentCar.currentOdometer)
      .sort((a, b) => a.nextKm - b.nextKm)
      .slice(0, 3);

    // 5. تنبيهات الوثائق (التي تنتهي قريباً)
    const docAlerts = docs
      .filter(d => {
        const daysLeft = Math.ceil((new Date(d.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 30; // تنتهي خلال 30 يوم
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    // 6. آخر العمليات (Recent Activity) - دمج وترتيب
    const allActivities = [
      ...fuel.map(r => ({ ...r, type: 'fuel', icon: Fuel, color: 'text-blue-500' })),
      ...expenses.map(r => ({ ...r, type: 'expense', icon: Wallet, color: 'text-purple-500' })),
      ...maintenance.map(r => ({ ...r, type: 'maintenance', icon: Wrench, color: 'text-yellow-500' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    setData({
      totalCost: grandTotal,
      monthlyCost: monthlyTotal,
      costPerKm,
      distance,
      upcomingMaintenance: maintAlerts,
      expiringDocs: docAlerts,
      recentActivity: allActivities
    });

  }, [currentCar]);

  const getFormattedDate = () => {
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Date().toLocaleDateString(localeMap[lang] || 'ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* 1. الشريط العلوي الثابت (Sticky Header) */}
      <div className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md pt-3 pb-3 -mx-4 px-4 flex justify-between items-center border-b border-[var(--border)]/50 transition-all">
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

      {/* 2. بطاقة السيارة الحالية (Car Card) */}
      <div className="hero-card p-5 mt-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs opacity-70 mb-1">{t('currentCar') || 'السيارة الحالية'}</p>
            <h3 className="text-2xl font-bold">{currentCar?.make} {currentCar?.model}</h3>
            <p className="text-sm opacity-80 mt-1">{currentCar?.plate}</p>
          </div>
          <Car size={32} className="opacity-40" />
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <button onClick={() => navigate('/vehicles')} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-lg flex justify-center items-center gap-1 transition-colors">
            <ArrowLeftRight size={14} /> {t('switchCar') || 'تغيير'}
          </button>
          <button onClick={() => navigate('/add-vehicle')} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-lg flex justify-center items-center gap-1 transition-colors">
            <Plus size={14} /> {t('addNewCar') || 'إضافة'}
          </button>
        </div>
      </div>

      {/* 3. إجراءات سريعة (Quick Actions) */}
      <div className="grid grid-cols-4 gap-2">
        <Link to="/fuel" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full mb-2"><Fuel size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('fuel') || 'وقود'}</span>
        </Link>
        <Link to="/expenses" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-full mb-2"><Wallet size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('expenses') || 'مصاريف'}</span>
        </Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-full mb-2"><Wrench size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('maintenance') || 'صيانة'}</span>
        </Link>
        <Link to="/documents" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors">
          <div className="p-2 bg-green-500/10 text-green-500 rounded-full mb-2"><FileText size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">{t('documents') || 'وثائق'}</span>
        </Link>
      </div>

      {/* 4. لوحة البيانات (KPIs) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('totalCost') || 'إجمالي المصاريف'}</span>
          <span className="text-lg font-bold text-[var(--text)]">{data.totalCost} <span className="text-xs font-normal">{currency}</span></span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('monthlyCost') || 'مصاريف الشهر'}</span>
          <span className="text-lg font-bold text-[var(--text)]">{data.monthlyCost} <span className="text-xs font-normal">{currency}</span></span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('costPerKm') || 'تكلفة الكيلومتر'}</span>
          <span className="text-lg font-bold text-[var(--text)]">{data.costPerKm} <span className="text-xs font-normal">{currency}</span></span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('distance') || 'المسافة المقطوعة'}</span>
          <span className="text-lg font-bold text-[var(--text)]">{data.distance} <span className="text-xs font-normal">KM</span></span>
        </div>
      </div>

      {/* 5. تنبيهات الصيانة القادمة */}
      {data.upcomingMaintenance.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <Wrench size={16} className="text-yellow-500"/> {t('upcomingMaintenance') || 'الصيانة القادمة'}
            </h3>
            <Link to="/maintenance" className="text-xs text-[var(--primary)]">{t('viewAll') || 'عرض الكل'}</Link>
          </div>
          <div className="space-y-2">
            {data.upcomingMaintenance.map(maint => (
              <div key={maint.id} className="flex justify-between items-center bg-[var(--surface-2)] p-2 rounded-lg text-xs">
                <span className="font-medium text-[var(--text)]">{t(maint.type) || maint.type}</span>
                <span className="text-[var(--text-muted)]">عند {maint.nextKm} KM</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. تنبيهات الوثائق */}
      {data.expiringDocs.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500"/> {t('expiringDocs') || 'وثائق تنتهي قريباً'}
            </h3>
            <Link to="/documents" className="text-xs text-[var(--primary)]">{t('viewAll') || 'عرض الكل'}</Link>
          </div>
          <div className="space-y-2">
            {data.expiringDocs.map(doc => (
              <div key={doc.id} className="flex justify-between items-center bg-[var(--surface-2)] p-2 rounded-lg text-xs">
                <span className="font-medium text-[var(--text)]">{t(doc.type) || doc.type}</span>
                <span className="text-red-400">{doc.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. آخر العمليات (Recent Activity) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <h3 className="font-bold text-sm text-[var(--text)] mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-[var(--primary)]"/> {t('recentActivity') || 'آخر العمليات'}
        </h3>
        {data.recentActivity.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">{t('noData') || 'لا توجد بيانات'}</p>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-[var(--border)] last:border-0 pb-2 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-[var(--surface-2)] ${act.color}`}>
                    <act.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text)]">{t(act.type) || act.type}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{act.date}</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-[var(--text)]">{act.cost} {currency}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
