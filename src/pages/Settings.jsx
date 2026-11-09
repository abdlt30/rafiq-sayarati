import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, Sun, Globe, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, 
  Bell, ShieldCheck, Database 
} from 'lucide-react';
// ✅ تم تصحيح مسار الاستيراد هنا ليطابق ملف CustomSelect.jsx
import CurrencySelector from '../components/ui/CustomSelect'; 

export default function Settings() {
  const { theme, toggleTheme, lang, changeLang, currency, setCurrency, t } = useContext(AppContext);
  const navigate = useNavigate();

  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('settings') || 'الإعدادات'}</h1>
      </div>
      
      {/* 1. المظهر */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <span className="font-bold text-sm text-[var(--text)]">
            {theme === 'dark' ? (t('darkMode') || 'الوضع الداكن') : (t('lightMode') || 'الوضع الفاتح')}
          </span>
        </div>
        <button 
          onClick={toggleTheme} 
          className={`w-14 h-7 rounded-full transition-colors relative flex items-center ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${theme === 'dark' ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></div>
        </button>
      </div>

      {/* 2. التفضيلات (اللغة والعملة) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setIsPrefsOpen(!isPrefsOpen)}
          className="w-full p-4 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
              <Globe size={20} />
            </div>
            <div className="text-start">
              <span className="font-bold text-sm text-[var(--text)] block">{t('preferences') || 'التفضيلات الإقليمية'}</span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5 block font-mono">{lang.toUpperCase()} • {currency}</span>
            </div>
          </div>
          {isPrefsOpen ? <ChevronUp size={20} className="text-[var(--text-muted)]" /> : <ChevronDown size={20} className="text-[var(--text-muted)]" />}
        </button>

        {isPrefsOpen && (
          <div className="p-4 border-t border-[var(--border)] space-y-6 bg-[var(--surface-2)]/30 animate-fade-in">
            
            {/* اختيار اللغة */}
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] mb-3 block flex items-center gap-2">
                <Globe size={14} /> {t('language') || 'لغة التطبيق'}
              </label>
              <div className="flex gap-2 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
                <button onClick={() => changeLang('ar')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${lang === 'ar' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>العربية</button>
                <button onClick={() => changeLang('en')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${lang === 'en' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>English</button>
                <button onClick={() => changeLang('fr')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${lang === 'fr' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>Français</button>
              </div>
            </div>

            {/* اختيار العملة */}
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] mb-3 block flex items-center gap-2">
                <span className="text-base font-bold">$</span> {t('currency') || 'عملة التطبيق'}
              </label>
              <CurrencySelector currentCurrency={currency} onSelect={setCurrency} />
            </div>
          </div>
        )}
      </div>

      {/* 3. الإشعارات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]"><Bell size={20} /></div>
          <span className="font-bold text-sm text-[var(--text)]">{t('notifications') || 'مركز التنبيهات'}</span>
        </div>
        <button 
          onClick={() => setNotificationsEnabled(!notificationsEnabled)} 
          className={`w-14 h-7 rounded-full transition-colors relative flex items-center ${notificationsEnabled ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${notificationsEnabled ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></div>
        </button>
      </div>

      {/* 4. الخصوصية والأمان */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck size={20} className="text-green-500" />
          <h2 className="font-bold text-sm text-[var(--text)]">{t('privacyAndSecurity') || 'الخصوصية والأمان'}</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
          جميع بياناتك محفوظة على هاتفك فقط. نحن لا نجمع أي بيانات شخصية. عند تفعيل المزامنة السحابية، ستكون بياناتك مشفرة وآمنة.
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><Database size={14} /> {t('version') || 'الإصدار'}</span>
          <span className="font-mono bg-[var(--surface-2)] px-2 py-1 rounded-md">v1.0.0</span>
        </div>
      </div>

    </div>
  );
}
