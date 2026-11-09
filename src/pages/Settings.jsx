import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, Sun, Globe, ArrowRight, ArrowLeft, Coins, 
  ChevronDown, ChevronUp, Bell, ShieldCheck, User, Database
} from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme, lang, changeLang, currency, setCurrency, t } = useContext(AppContext);
  const navigate = useNavigate();

  // حالة لفتح/إغلاق بطاقة التفضيلات
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  // قائمة العملات العربية والعالمية الشاملة
  const currenciesList = [
    { code: 'MAD', name: 'درهم مغربي (MAD)' },
    { code: 'SAR', name: 'ريال سعودي (SAR)' },
    { code: 'AED', name: 'درهم إماراتي (AED)' },
    { code: 'EGP', name: 'جنيه مصري (EGP)' },
    { code: 'QAR', name: 'ريال قطري (QAR)' },
    { code: 'KWD', name: 'دينار كويتي (KWD)' },
    { code: 'BHD', name: 'دينار بحريني (BHD)' },
    { code: 'OMR', name: 'ريال عماني (OMR)' },
    { code: 'JOD', name: 'دينار أردني (JOD)' },
    { code: 'DZD', name: 'دينار جزائري (DZD)' },
    { code: 'TND', name: 'دينار تونسي (TND)' },
    { code: 'LYD', name: 'دينار ليبي (LYD)' },
    { code: 'USD', name: 'دولار أمريكي (USD)' },
    { code: 'EUR', name: 'يورو (EUR)' },
  ];

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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center">
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

      {/* 2. التفضيلات (اللغة والعملة) - البطاقة القابلة للطي */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300">
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
              <span className="text-xs text-[var(--text-muted)] mt-0.5 block">{lang.toUpperCase()} • {currency}</span>
            </div>
          </div>
          {isPrefsOpen ? <ChevronUp size={20} className="text-[var(--text-muted)]" /> : <ChevronDown size={20} className="text-[var(--text-muted)]" />}
        </button>

        {/* المحتوى المخفي */}
        {isPrefsOpen && (
          <div className="p-4 border-t border-[var(--border)] space-y-6 bg-[var(--surface-2)]/30">
            
            {/* اختيار اللغة */}
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] mb-3 block flex items-center gap-2">
                <Globe size={14} /> {t('language') || 'لغة التطبيق'}
              </label>
              <div className="flex gap-2">
                <button onClick={() => changeLang('ar')} className={`flex-1 p-2.5 rounded-xl font-bold text-sm transition-colors ${lang === 'ar' ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'}`}>العربية</button>
                <button onClick={() => changeLang('en')} className={`flex-1 p-2.5 rounded-xl font-bold text-sm transition-colors ${lang === 'en' ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'}`}>English</button>
                <button onClick={() => changeLang('fr')} className={`flex-1 p-2.5 rounded-xl font-bold text-sm transition-colors ${lang === 'fr' ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'}`}>Français</button>
              </div>
            </div>

            {/* اختيار العملة */}
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] mb-3 block flex items-center gap-2">
                <Coins size={14} /> {t('currency') || 'عملة التطبيق'}
              </label>
              <div className="relative">
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 text-[var(--text)] font-bold outline-none focus:border-[var(--primary)] appearance-none cursor-pointer"
                >
                  {currenciesList.map((curr) => (
                    <option key={curr.code} value={curr.code}>{curr.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. الإشعارات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]"><Bell size={20} /></div>
          <span className="font-bold text-sm text-[var(--text)]">{t('notifications') || 'التنبيهات'}</span>
        </div>
        <span className="text-xs font-bold bg-[var(--surface-2)] text-[var(--text-muted)] px-2.5 py-1 rounded-md">مفعّل</span>
      </div>

      {/* 4. الخصوصية والأمان */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-6">
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
