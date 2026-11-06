import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { 
  Wallet, Gauge, Fuel, Wrench, Car, FileText, Bell, Settings, 
  ChevronLeft, ShieldAlert, CalendarDays 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentCar, t } = useContext(AppContext);
  const navigate = useNavigate();
  
  // الحالات
  const [totals, setTotals] = useState({ fuel: 0, maintenance: 0, expenses: 0, total: 0 });
  const [recent, setRecent] = useState([]);
  const [nextMaint, setNextMaint] = useState(null);
  const [expDocs, setExpDocs] = useState([]);

  useEffect(() => {
    if (currentCar) {
      // 1. جلب الإحصائيات
      const currentTotals = dbService.getTotals(currentCar.id);
      setTotals(currentTotals);

      // 2. جلب آخر العمليات
      const allExpenses = [
        ...dbService.getFuel().filter(r => r.carId === currentCar.id).map(r => ({...r, type: 'fuel'})),
        ...dbService.getMaintenance().filter(r => r.carId === currentCar.id).map(r => ({...r, type: 'maintenance'})),
        ...dbService.getExpenses().filter(r => r.carId === currentCar.id).map(r => ({...r, type: 'expense'}))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
      setRecent(allExpenses);

      // 3. جلب أقرب صيانة
      const maint = dbService.getMaintenance().filter(m => m.carId === currentCar.id && m.nextKm);
      if (maint.length > 0) {
        setNextMaint(maint.sort((a,b) => a.nextKm - b.nextKm)[0]);
      }

      // 4. جلب الوثائق التي تنتهي قريباً
      const docs = dbService.getDocuments().filter(d => d.carId === currentCar.id);
      const expiring = docs.filter(d => {
        if(!d.endDate) return false;
        const days = Math.ceil((new Date(d.endDate) - new Date()) / (1000*60*60*24));
        return days <= 30;
      }).sort((a,b) => new Date(a.endDate) - new Date(b.endDate));
      setExpDocs(expiring);
    }
  }, [currentCar]);

  if (!currentCar) return <div className="p-10 text-center">{t('noVehicles')}</div>;

  // الحسابات
  const purchasePrice = Number(currentCar.purchasePrice) || 0;
  const totalCost = purchasePrice + totals.total;
  const currentOdo = Number(currentCar.currentOdometer) || 0;
  const costPerKm = currentOdo > 0 ? (totalCost / currentOdo).toFixed(2) : '0.00';
  
  // تنسيق التاريخ
  const today = new Date();
  const dateStr = today.toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4 pb-24">
      
      {/* 1. الشريط العلوي (ترحيب وتاريخ + أيقونة الإعدادات) */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{t('welcome')} عبدو 👋</h2>
          <p className="text-xs text-[var(--text-muted)]">{dateStr}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/notifications')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] relative">
            <Bell size={18} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={() => navigate('/settings')} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)]"><Settings size={18} /></button>
        </div>
      </div>

      {/* 2. بطاقة السيارة الصغيرة (التبديل) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--surface-2)] rounded-lg flex items-center justify-center text-[var(--primary)]"><Car size={20}/></div>
          <div>
            <p className="text-sm font-bold">{currentCar.make} {currentCar.model}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{currentCar.plate}</p>
          </div>
        </div>
        <button onClick={() => navigate('/vehicles')} className="text-xs bg-[var(--primary-soft)] text-[var(--primary)] px-3 py-2 rounded-lg flex items-center gap-1 font-bold">
          {t('switchCar')} <ChevronLeft size={14} />
        </button>
      </div>

      {/* 3. البطاقة الكبيرة (Hero Card) */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl p-5 text-white overflow-hidden shadow-lg shadow-blue-900/30">
        <Car size={140} className="absolute -bottom-6 -left-6 opacity-10 pointer-events-none" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{currentCar.make} {currentCar.model}</h2>
            <p className="text-blue-200 text-sm mt-1">{currentCar.plate} • {currentCar.fuelType || 'بنزين'}</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl flex flex-col items-center backdrop-blur-md">
            <span className="font-bold text-lg">{currentOdo.toLocaleString()}</span>
            <span className="text-[10px]">KM</span>
          </div>
        </div>
      </div>

      {/* 4. الإجراءات السريعة (4 أزرار) */}
      <div className="grid grid-cols-4 gap-2">
        <Link to="/fuel" className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-[var(--surface-2)] transition">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Fuel size={18}/></div>
          <span className="text-[10px] text-center text-[var(--text-muted)]">{t('addFuel')}</span>
        </Link>
        <Link to="/expenses" className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-[var(--surface-2)] transition">
          <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><Wallet size={18}/></div>
          <span className="text-[10px] text-center text-[var(--text-muted)]">{t('addExpense')}</span>
        </Link>
        <Link to="/maintenance" className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-[var(--surface-2)] transition">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg"><Wrench size={18}/></div>
          <span className="text-[10px] text-center text-[var(--text-muted)]">{t('addMaintenance')}</span>
        </Link>
        <Link to="/documents" className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-[var(--surface-2)] transition">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><FileText size={18}/></div>
          <span className="text-[10px] text-center text-[var(--text-muted)]">{t('addDocument')}</span>
        </Link>
      </div>

      {/* 5. لوحة البيانات (KPIs) */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('totalCost')}</span>
          <span className="text-lg font-bold">{totalCost} <span className="text-xs">MAD</span></span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('costPerKm')}</span>
          <span className="text-lg font-bold">{costPerKm} <span className="text-xs">MAD</span></span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('month')}</span>
          <span className="text-lg font-bold">{totals.expenses} <span className="text-xs">MAD</span></span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl">
          <span className="text-[10px] text-[var(--text-muted)] block mb-1">{t('distance')}</span>
          <span className="text-lg font-bold">{currentOdo.toLocaleString()} <span className="text-xs">KM</span></span>
        </div>
      </div>

      {/* 6. بطاقة الصيانة القادمة */}
      {nextMaint && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl mt-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><Wrench size={16} className="text-yellow-500"/> {t('nextMaintenance')}</h3>
            <Link to="/maintenance" className="text-xs text-[var(--primary)]">{t('viewAll')}</Link>
          </div>
          <div className="flex justify-between items-center bg-[var(--surface-2)] p-2 rounded-xl">
            <span className="text-xs font-bold">{nextMaint.type}</span>
            <span className="text-xs text-yellow-500 font-mono">باقي {nextMaint.nextKm - currentOdo} KM</span>
          </div>
        </div>
      )}

      {/* 7. بطاقة الوثائق المنتهية */}
      {expDocs.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl mt-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><ShieldAlert size={16} className="text-red-500"/> {t('expiringDocs')}</h3>
            <Link to="/documents" className="text-xs text-[var(--primary)]">{t('viewAll')}</Link>
          </div>
          <div className="space-y-2">
            {expDocs.slice(0, 2).map(doc => (
              <div key={doc.id} className="flex justify-between items-center text-xs bg-[var(--surface-2)] p-2 rounded-xl">
                <span className="font-bold">{doc.type}</span>
                <span className="text-red-500 font-mono">{doc.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. بطاقة آخر العمليات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl mt-2 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold">{t('recentActivity')}</h3>
          <Link to="/expenses" className="text-xs text-[var(--primary)]">{t('viewAll')}</Link>
        </div>
        <div className="space-y-3">
          {recent.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-[var(--border)] last:border-0 pb-2 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.type === 'fuel' ? 'bg-blue-500/10 text-blue-500' : item.type === 'maintenance' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                  {item.type === 'fuel' ? <Fuel size={16}/> : item.type === 'maintenance' ? <Wrench size={16}/> : <Wallet size={16}/>}
                </div>
                <div>
                  <p className="text-xs font-bold">{item.type === 'fuel' ? 'تعبئة وقود' : item.type === 'maintenance' ? 'صيانة' : 'مصروف'}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{item.date}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-400">-{item.cost || item.amount} MAD</span>
            </div>
          ))}
          {recent.length === 0 && <p className="text-xs text-[var(--text-muted)] text-center">لا توجد عمليات حديثة.</p>}
        </div>
      </div>

    </div>
  );
}
