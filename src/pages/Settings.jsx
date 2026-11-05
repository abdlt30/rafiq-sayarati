import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Moon, Sun, Globe, Trash2, User } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useContext(AppContext);

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

      {/* اللغة */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text)] mb-2">اللغة</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--surface-2)] text-[var(--primary)]"><Globe size={20} /></div>
            <span className="text-[var(--text)] font-medium">العربية</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">افتراضية</span>
        </div>
      </div>

      {/* منطقة الخطر */}
      <div className="bg-[var(--surface)] border border-red-500/30 rounded-2xl p-4 mt-8">
        <h2 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2"><Trash2 size={20}/> منطقة الخطر</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">سيتم مسح جميع السيارات، المصاريف، سجلات الصيانة، والوثائق نهائياً.</p>
        <button onClick={() => { localStorage.clear(); window.location.href = '/#/welcome'; window.location.reload(); }} className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl">
          مسح جميع البيانات
        </button>
      </div>
    </div>
  );
}
