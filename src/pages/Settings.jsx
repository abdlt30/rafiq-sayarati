import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
// تمت إضافة ArrowLeft و Coins
import { Moon, Sun, Globe, ArrowRight, ArrowLeft, Coins } from 'lucide-react'; 

export default function Settings() {
  // 1. إضافة currency و setCurrency من الـ Context
  const { theme, toggleTheme, lang, changeLang, currency, setCurrency, t } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-24">
      {/* زر الرجوع (يتغير اتجاهه حسب اللغة) */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-[var(--surface-2)] rounded-xl text-[var(--text)]">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
      </div>
      
      {/* المظهر */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--surface-2)]">{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}</div>
          <span className="font-medium">{theme === 'dark' ? (t('darkMode') || 'الوضع الداكن') : (t('lightMode') || 'الوضع الفاتح')}</span>
        </div>
        <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-slate-300'} relative`}>
          <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${theme === 'dark' ? 'left-0.5' : 'right-0.5'}`}></div>
        </button>
      </div>

      {/* اللغة */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Globe size={20}/> {t('language')}</h2>
        <div className="flex gap-2">
          <button onClick={() => changeLang('ar')} className={`flex-1 p-3 rounded-xl font-bold ${lang === 'ar' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>العربية</button>
          <button onClick={() => changeLang('en')} className={`flex-1 p-3 rounded-xl font-bold ${lang === 'en' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>English</button>
          <button onClick={() => changeLang('fr')} className={`flex-1 p-3 rounded-xl font-bold ${lang === 'fr' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>Français</button>
        </div>
      </div>

      {/* العملة (تمت إضافتها حديثاً) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Coins size={20}/> {t('currency') || 'العملة'}</h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrency('MAD')} className={`flex-1 p-3 rounded-xl font-bold ${currency === 'MAD' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>MAD (درهم)</button>
          <button onClick={() => setCurrency('EUR')} className={`flex-1 p-3 rounded-xl font-bold ${currency === 'EUR' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>EUR (يورو)</button>
          <button onClick={() => setCurrency('USD')} className={`flex-1 p-3 rounded-xl font-bold ${currency === 'USD' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>USD (دولار)</button>
        </div>
      </div>

    </div>
  );
}
