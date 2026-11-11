import { useContext, useMemo } from 'react'; // ✅ إضافة useMemo
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService'; // ✅ استدعاء محرك التنبيهات
import { 
  Car, FileText, Bell, Settings, Info, Database, 
  PieChart, Clock, Tag, ShieldAlert, ChevronLeft, ChevronRight,
  MapPin, TrendingUp
} from 'lucide-react';

// ✅ مكون مساعد (خارج الدالة الرئيسية لتحسين الأداء)
const MenuRow = ({ icon: Icon, label, path, color, badge }) => {
  const { lang } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(path)} 
      className="w-full flex items-center justify-between p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors mb-2 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-[var(--surface-2)] ${color}`}>
          <Icon size={18} />
        </div>
        <span className="text-sm font-bold text-[var(--text)]">{label}</span>
        {/* ✅ عرض الشارة فقط إذا كان هناك تنبيهات حقيقية */}
        {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      {lang === 'ar' ? <ChevronLeft size={16} className="text-[var(--text-muted)]" /> : <ChevronRight size={16} className="text-[var(--text-muted)]" />}
    </button>
  );
};

export default function More() {
  // ✅ جلب السيارة الحالية واللغة لحساب التنبيهات
  const { t, currentCar, lang } = useContext(AppContext);

  // ✅ الخوارزمية الذكية: حساب التنبيهات غير المقروءة
  const unreadCount = useMemo(() => {
    if (!currentCar) return 0;
    try {
      // 1. جلب جميع التنبيهات الحالية من المحرك
      const alerts = notificationService.generateSmartAlerts(currentCar, t, lang);
      
      // 2. جلب معرفات التنبيهات التي قرأها المستخدم سابقاً
      const readIds = JSON.parse(localStorage.getItem('read_notifications')) || [];
      
      // 3. تصفية التنبيهات التي لم يقرأها المستخدم
      const unreadAlerts = alerts.filter(a => !readIds.includes(a.id));
      
      return unreadAlerts.length;
    } catch (e) {
      return 0; // في حال حدوث خطأ، لا نظهر شارة
    }
  }, [currentCar, t, lang]);

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[var(--text)]">{t('more') || 'المزيد'}</h1>

      {/* قسم الإدارة */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">
          {t('management') || 'الإدارة'}
        </h2>
        <MenuRow icon={Car} label={t('vehicles') || 'السيارات'} path="/vehicles" color="text-blue-500" />
        <MenuRow icon={FileText} label={t('documents') || 'الوثائق'} path="/documents" color="text-purple-500" />
        <MenuRow icon={Bell} label={t('reminders') || 'التذكيرات'} path="/reminders" color="text-yellow-500" />
        
        <MenuRow icon={TrendingUp} label={t('income') || 'الإيرادات'} path="/income" color="text-green-500" />
        
        <MenuRow icon={MapPin} label={t('fuelStations') || 'محطات الوقود'} path="/fuel-stations" color="text-red-500" />
      </div>

      {/* قسم التحليلات */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">
          {t('insights') || 'التحليلات'}
        </h2>
        <MenuRow icon={PieChart} label={t('reports') || 'التقارير'} path="/reports" color="text-green-500" />
        <MenuRow icon={Clock} label={t('timeline') || 'سجل السيارة'} path="/timeline" color="text-orange-500" />
        <MenuRow icon={Tag} label={t('valuation') || 'تقييم السيارة'} path="/valuation" color="text-teal-500" />
      </div>

      {/* قسم النظام */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">
          {t('system') || 'النظام'}
        </h2>
        
        {/* ✅ إصلاح: الشارة الآن ديناميكية وتختفي إذا كان العدد 0 */}
        <MenuRow 
          icon={ShieldAlert} 
          label={t('notifications') || 'مركز التنبيهات'} 
          path="/notifications" 
          color="text-red-500" 
          badge={unreadCount > 0 ? unreadCount.toString() : null} 
        />
        
        <MenuRow icon={Database} label={t('backup') || 'النسخ الاحتياطي'} path="/backup" color="text-indigo-500" />
        <MenuRow icon={Settings} label={t('settings') || 'الإعدادات'} path="/settings" color="text-slate-500" />
        <MenuRow icon={Info} label={t('aboutApp') || 'حول التطبيق'} path="/about" color="text-sky-500" />
      </div>
    </div>
  );
}
