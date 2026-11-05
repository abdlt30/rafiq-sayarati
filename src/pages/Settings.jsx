import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Moon, Sun, Globe, Trash2 } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme, lang, changeLang } = useContext(AppContext);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">الإعدادات</h1>
      
      {/* المظهر */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text)] mb-2">المظهر</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <span className="text-[var(--text)] font-medium">الوضع {theme === 'dark' ? 'الداكن' : 'الفاتح'}</span>
          </div>
          <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-slate-300'} relative`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${theme === 'dark' ? 'left-0.5' : 'right-0.5'}`}></div>
          </button>
        </div>
      </div>

      {/* اللغة (محدث) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text)] mb-2">اللغة</h2>
        <div className="flex gap-2">
          <button onClick={() => changeLang('ar')} className={`flex-1 p-3 rounded-xl font-bold ${lang === 'ar' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>العربية</button>
          <button onClick={() => changeLang('en')} className={`flex-1 p-3 rounded-xl font-bold ${lang === 'en' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>English</button>
          <button onClick={() => changeLang('fr')} className={`flex-1 p-3 rounded-xl font-bold ${lang === 'fr' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>Français</button>
        </div>
      </div>

      {/* منطقة الخطر ... (كما هي) */}
    </div>
  );
}
