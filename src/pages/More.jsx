import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { 
  Car, FileText, Bell, Settings, Info, Database, 
  PieChart, Clock, Tag, ShieldAlert, ChevronLeft, ChevronRight,
  MapPin, TrendingUp
} from 'lucide-react';

// ✅ مكوّن مساعد (خارج الدالة الرئيسية لتحسين الأداء)
const MenuRow = ({ icon: Icon, label, path, color, badge }) => {
  const { lang } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <button 
      type="button"
      onClick={() => navigate(path)} 
      className="w-full flex items-center justify-between p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors mb-2 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-[var(--surface-2)] ${color}`}>
          <Icon size={18} aria-hidden="true" />
        </div>
        <span className="text-sm font-bold text-[var(--text)]">{label}</span>
        {/* ✅ الشارة */}
        {badge && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {badge}
          </span>
        )}
      </div>
      {lang === 'ar' 
        ? <ChevronLeft size={16} className="text-[var(--text-muted)]" aria-hidden="true" /> 
        : <ChevronRight size={16} className="text-[var(--text-muted)]" aria-hidden="true" />}
    </button>
  );
};

export default function More() {
  const { t, currentCar, lang, dataVersion } = useContext(AppContext);
  const location = useLocation();

  /* ✅ حساب التنبيهات غير المقروءة (مُحصن + O(1)) */
  const unreadCount = useMemo(() => {
    if (!currentCar) return 0;
    try {
      const alerts = notificationService.generateSmartAlerts(currentCar, t, lang);
      
      // ✅ حماية JSON من التلف
      const saved = localStorage.getItem('read_notifications');
      const parsed = saved ? JSON.parse(saved) : [];
      const readIds = Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
      
      // ✅ Set للبحث السريع O(1)
      const readSet = new Set(readIds);
      const unreadAlerts = alerts.filter(a => !readSet.has(a.id));
      return unreadAlerts.length;
    } catch (e) {
      console.error('unreadCount failed:', e);
      return 0;
    }
    // ✅ location.pathname + dataVersion لضمان التحديث عند العودة أو إضافة سجل
  }, [currentCar, t, lang, location.pathname, dataVersion]);

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[var(--text)]">{t('more')}</h1>

      {/* قسم الإدارة */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">
          {t('management')}
        </h2>
        <MenuRow icon={Car} label={t('vehicles')} path="/vehicles" color="text-blue-500" />
        <MenuRow icon={FileText} label={t('documents')} path="/documents" color="text-purple-500" />
        <MenuRow icon={Bell} label={t('reminders')} path="/reminders" color="text-yellow-500" />
        <MenuRow icon={TrendingUp} label={t('income')} path="/income" color="text-green-500" />
        <MenuRow icon={MapPin} label={t('fuelStations')} path="/fuel-stations" color="text-red-500" />
      </div>

      {/* قسم التحليلات */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">
          {t('insights')}
        </h2>
        <MenuRow icon={PieChart} label={t('reports')} path="/reports" color="text-green-500" />
        <MenuRow icon={Clock} label={t('timeline')} path="/timeline" color="text-orange-500" />
        <MenuRow icon={Tag} label={t('valuation')} path="/valuation" color="text-teal-500" />
      </div>

      {/* قسم النظام */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">
          {t('system')}
        </h2>
        
        <MenuRow 
          icon={ShieldAlert} 
          label={t('notifications')} 
          path="/notifications" 
          color="text-red-500" 
          badge={unreadCount > 0 ? unreadCount.toString() : null} 
        />
        
        <MenuRow icon={Database} label={t('backup')} path="/backup" color="text-indigo-500" />
        <MenuRow icon={Settings} label={t('settings')} path="/settings" color="text-slate-500" />
        <MenuRow icon={Info} label={t('aboutApp')} path="/about" color="text-sky-500" />
      </div>
    </div>
  );
}
