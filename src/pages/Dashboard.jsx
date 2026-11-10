import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { 
  Car, Fuel, Wrench, Wallet, FileText, 
  AlertTriangle, ChevronLeft, CalendarDays, Gauge, Activity
} from 'lucide-react';

export default function Dashboard() {
  const { currentCar, t, currency } = useContext(AppContext);

  // 1. حساب الإحصائيات بأمان تام (استخدام ?. لمنع الانهيار)
  const totals = useMemo(() => {
    if (!currentCar) return { fuel: 0, maintenance: 0, expenses: 0, total: 0 };
    return dbService.getTotals(currentCar.id) || { fuel: 0, maintenance: 0, expenses: 0, total: 0 };
  }, [currentCar]);

  // 2. جلب آخر العمليات
  const recentActivity = useMemo(() => {
    if (!currentCar) return [];
    const fuel = (dbService.getFuel() || []).filter(f => f.carId === currentCar.id).map(f => ({ ...f, type: 'fuel' }));
    const maintenance = (dbService.getMaintenance() || []).filter(m => m.carId === currentCar.id).map(m => ({ ...m, type: 'maintenance' }));
    const expenses = (dbService.getExpenses() || []).filter(e => e.carId === currentCar.id).map(e => ({ ...e, type: 'expense' }));
    
    return [...fuel, ...maintenance, ...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4); // آخر 4 عمليات فقط
  }, [currentCar]);

  if (!currentCar) return null; // حماية

  // الحصول على التاريخ الحالي
  const today = new Date().toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5 pb-24 px-4 pt-4">
      
      {/* 1. الترحيب والتاريخ */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">مرحباً 👋</h1>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold">{today}</p>
        </div>
      </div>

      {/* 2. بطاقة السيارة الحالية */}
      <div className="bg-gradient-to-br from-blue-900/40 to-[var(--surface)] border border-blue-500/20 p-4 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Car size={100} />
        </div>
        
        <p className="text-xs text-blue-300 font-bold mb-3">السيارة الحالية</p>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-20 h-16 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
             {currentCar.image ? (
               <img src={currentCar.image} alt="car" className="w-full h-full object-cover" />
             ) : (
               <Car size={32} className="text-white/50" />
             )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white leading-tight">{currentCar.make} {currentCar.model}</h2>
            <p className="text-sm font-mono text-blue-200 mt-1 bg-blue-500/20 px-2 py-0.5 rounded inline-block">{currentCar.plate || 'بدون لوحة'}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 relative z-10">
          <Link to="/vehicles" className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl text-center backdrop-blur-md transition-colors flex items-center justify-center gap-1">
            تغيير السيارة
          </Link>
          <Link to="/add-vehicle" className="flex-1 bg-[var(--primary)] hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl text-center shadow-lg transition-colors flex items-center justify-center gap-1">
            إضافة سيارة +
          </Link>
        </div>
      </div>

      {/* 3. الإجراءات السريعة (المربعات الأربعة) */}
      <div className="grid grid-cols-4 gap-2">
        <Link to="/fuel" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 transition-colors">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg mb-2"><Fuel size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text)]">وقود</span>
        </Link>
        <Link to="/maintenance" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-yellow-500/50 transition-colors">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg mb-2"><Wrench size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text)]">صيانة</span>
        </Link>
        <Link to="/expenses" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-purple-500/50 transition-colors">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg mb-2"><Wallet size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text)]">مصاريف</span>
        </Link>
        <Link to="/documents" className="flex flex-col items-center justify-center p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-green-500/50 transition-colors">
          <div className="p-2 bg-green-500/10 text-green-500 rounded-lg mb-2"><FileText size={20} /></div>
          <span className="text-[10px] font-bold text-[var(--text)]">وثائق</span>
        </Link>
      </div>

      {/* 4. بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <p className="text-[11px] text-[var(--text-muted)] font-bold mb-1">إجمالي المصاريف</p>
          <p className="text-xl font-extrabold text-[var(--text)]">{totals.total.toLocaleString()} <span className="text-xs font-normal">{currency}</span></p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
          <p className="text-[11px] text-[var(--text-muted)] font-bold mb-1">عداد السيارة</p>
          <p className="text-xl font-extrabold text-blue-500 flex items-center gap-1">
            {Number(currentCar.odometer || 0).toLocaleString()} <span className="text-xs font-normal">KM</span>
          </p>
        </div>
      </div>

      {/* 5. آخر العمليات */}
      <div>
        <div className="flex justify-between items-center mb-3">
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
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bg} ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text)]">
                        {isFuel ? 'تعبئة وقود' : isMaint ? (activity.type || 'صيانة') : (activity.type || 'مصروف')}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">{activity.date}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[var(--text)]">
                    {Number(activity.cost || 0).toLocaleString()} <span className="text-[10px] font-normal">{currency}</span>
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
