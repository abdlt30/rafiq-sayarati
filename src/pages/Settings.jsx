import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, Sun, Globe, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, 
  Bell, ShieldCheck, Database 
} from 'lucide-react';
import CurrencySelector from '../components/ui/CustomSelect'; 

export default function Settings() {
  const { theme, toggleTheme, lang, changeLang, currency, setCurrency, t } = useContext(AppContext);
  const navigate = useNavigate();

  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="space-y-3 pb-24 px-4 pt-2">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('settings') || 'الإعدادات'}</h1>
      </div>
      
      {/* 1. المظهر */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <span className="font-bold text-sm text-[var(--text)]">
            {theme === 'dark' ? (t('darkMode') || 'الوضع الداكن') : (t('lightMode') || 'الوضع الفاتح')}
          </span>
        </div>
        {/* تم تصغير مفتاح التبديل ليكون أنيقاً */}
        <button 
          onClick={toggleTheme} 
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${theme === 'dark' ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></div>
        </button>
      </div>

      {/* 2. التفضيلات (اللغة والعملة) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setIsPrefsOpen(!isPrefsOpen)}
          className="w-full p-3.5 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
              <Globe size={18} />
            </div>
            <div className="text-start">
              <span className="font-bold text-sm text-[var(--text)] block">{t('preferences') || 'التفضيلات الإقليمية'}</span>
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block font-mono tracking-wider">{lang.toUpperCase()} • {currency}</span>
            </div>
          </div>
          {isPrefsOpen ? <ChevronUp size={18} className="text-[var(--text-muted)]" /> : <ChevronDown size={18} className="text-[var(--text-muted)]" />}
        </button>

        {isPrefsOpen && (
          <div className="p-3.5 border-t border-[var(--border)] space-y-5 bg-[var(--surface-2)]/30 animate-fade-in">
            
            {/* اختيار اللغة */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] mb-2 block flex items-center gap-1.5">
                <Globe size={12} /> {t('language') || 'لغة التطبيق'}
              </label>
              <div className="flex gap-1.5 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
                <button onClick={() => changeLang('ar')} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${lang === 'ar' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>العربية</button>
                <button onClick={() => changeLang('en')} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${lang === 'en' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>English</button>
                <button onClick={() => changeLang('fr')} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${lang === 'fr' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>Français</button>
              </div>
            </div>

            {/* اختيار العملة */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] mb-2 block flex items-center gap-1.5">
                <span className="text-sm font-bold">$</span> {t('currency') || 'عملة التطبيق'}
              </label>
              <CurrencySelector currentCurrency={currency} onSelect={setCurrency} />
            </div>
          </div>
        )}
      </div>

      {/* 3. الإشعارات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]"><Bell size={18} /></div>
          <span className="font-bold text-sm text-[var(--text)]">{t('notifications') || 'مركز التنبيهات'}</span>
        </div>
        <button 
          onClick={() => setNotificationsEnabled(!notificationsEnabled)} 
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${notificationsEnabled ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${notificationsEnabled ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></div>
        </button>
      </div>

      {/* 4. الخصوصية والأمان */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2.5">
          <ShieldCheck size={18} className="text-green-500" />
          <h2 className="font-bold text-sm text-[var(--text)]">{t('privacyAndSecurity') || 'الخصوصية والأمان'}</h2>
        </div>
        {/* ✅ تم استخدام الترجمة هنا بدلاً من النص الثابت */}
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
          {t('privacyText') || 'جميع بياناتك محفوظة على هاتفك فقط. نحن لا نجمع أي بيانات شخصية. عند تفعيل المزامنة السحابية، ستكون بياناتك مشفرة وآمنة.'}
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><Database size={12} /> {t('version') || 'الإصدار'}</span>
          <span className="font-mono bg-[var(--surface-2)] px-2 py-0.5 rounded-md">v1.0.0</span>
        </div>
      </div>

    </div>
  );
}
