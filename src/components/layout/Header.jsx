import { Link } from 'react-router-dom';
import { Settings, Bell, Car, Sun, Moon } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';

export default function Header() {
  const { theme, toggleTheme, t } = useContext(AppContext);

  return (
    <header className="flex justify-between items-center p-4 bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40 transition-colors">
      
      {/* الجانب الأيسر: شعار التطبيق فقط */}
      <Link to="/" aria-label={t('home')} className="flex items-center gap-2 active:scale-95 transition-transform">
        <Car className="text-[var(--primary)]" size={26} />
      </Link>

      {/* الجانب الأيمن: أزرار التحكم */}
      <div className="flex gap-2">
        <button 
          type="button"
          onClick={toggleTheme} 
          className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90 transition-all"
          aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* ✅ توحيد المسار ليكون مركز التنبيهات */}
        <Link 
          to="/notifications" 
          aria-label={t('notifications')}
          className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90 transition-all"
        >
          <Bell size={20} />
        </Link>
        
        <Link 
          to="/settings" 
          aria-label={t('settings')}
          className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90 transition-all"
        >
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
