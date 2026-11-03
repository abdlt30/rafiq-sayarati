import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Settings, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-700 px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="text-slate-400 hover:text-white transition-colors">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <Link to="/more" className="text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
        </Link>
      </div>
      <div className="text-brand-500 font-bold text-lg">رفيق سيارتي</div>
    </header>
  );
}
