import { Link } from 'react-router-dom';
import { Settings, Bell, Car, Sun, Moon } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';

export default function Header() {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <header className="flex justify-between items-center p-4 bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40 transition-colors">
      
      {/* الجانب الأيسر: شعار التطبيق فقط (بدون اسم) */}
      <div className="flex items-center gap-2">
        <Car className="text-[var(--primary)]" size={26} />
      </div>

      {/* الجانب الأيمن: أزرار التحكم */}
      <div className="flex gap-2">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <Link 
          to="/reminders" 
          className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <Bell size={20} />
        </Link>
        
        <Link 
          to="/settings" 
          className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
