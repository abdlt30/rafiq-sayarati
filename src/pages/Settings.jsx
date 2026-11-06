import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Globe, ArrowRight, ArrowLeft, Coins, Info, ShieldCheck } from 'lucide-react'; 

export default function Settings() {
  const { theme, toggleTheme, lang, changeLang, currency, setCurrency, t } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      
      {/* الشريط العلوي الثابت (Sticky) */}
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('settings') || 'الإعدادات'}</h1>
      </div>
      
      {/* المظهر */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <span className="font-bold text-sm text-[var(--text)]">
            {theme === 'dark' ? (t('darkMode') || 'الوضع الداكن') : (t('lightMode') || 'الوضع الفاتح')}
          </span>
        </div>
        
        {/* مفتاح تبديل محسن */}
        <button 
          onClick={toggleTheme} 
          className={`w-14 h-7 rounded-full transition-colors relative flex items-center ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${theme === 'dark' ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></div>
        </button>
      </div>

      {/* اللغة */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="font-bold text-sm text-[var(--text)] mb-4 flex items-center gap-2">
          <Globe size={18} className="text-[var(--primary)]"/> {t('language') || 'اللغة'}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeLang('ar')} className={`flex-1 p-3 rounded-xl font-bold text-sm transition-colors ${lang === 'ar' ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]'}`}>العربية</button>
          <button onClick={() => changeLang('en')} className={`flex-1 p-3 rounded-xl font-bold text-sm transition-colors ${lang === 'en' ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]'}`}>English</button>
          <button onClick={() => changeLang('fr')} className={`flex-1 p-3 rounded-xl font-bold text-sm transition-colors ${lang === 'fr' ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]'}`}>Français</button>
        </div>
      </div>

      {/* العملة */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="font-bold text-sm text-[var(--text)] mb-4 flex items-center gap-2">
          <Coins size={18} className="text-[var(--primary)]"/> {t('currency') || 'العملة'}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrency('MAD')} className={`flex-1 p-3 rounded-xl font-bold text-sm transition-colors ${currency === 'MAD' ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]'}`}>MAD (درهم)</button>
          <button onClick={() => setCurrency('EUR')} className={`flex-1 p-3 rounded-xl font-bold text-sm transition-colors ${currency === 'EUR' ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]'}`}>EUR (يورو)</button>
          <button onClick={() => setCurrency('USD')} className={`flex-1 p-3 rounded-xl font-bold text-sm transition-colors ${currency === 'USD' ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]'}`}>USD (دولار)</button>
        </div>
      </div>

      {/* قسم معلومات التطبيق (لمسة احترافية) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mt-8">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck size={20} className="text-green-500" />
          <h2 className="font-bold text-sm text-[var(--text)]">الخصوصية والأمان</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
          جميع بياناتك محفوظة على هاتفك فقط. نحن لا نجمع أي بيانات شخصية.
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><Info size={14} /> الإصدار</span>
          <span className="font-mono bg-[var(--surface-2)] px-2 py-1 rounded-md">v1.0.0</span>
        </div>
      </div>

    </div>
  );
}
