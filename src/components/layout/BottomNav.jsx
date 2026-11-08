import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);
  const location = useLocation();
  const [debugUrl, setDebugUrl] = useState('');

  // تحديث شريط التشخيص عند أي تغيير
  useEffect(() => {
    setDebugUrl(window.location.hash || '#/');
  }, [location]);

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية', match: '#/' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف', match: '#/expenses' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة', match: '#/maintenance' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق', match: '#/documents' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد', match: '#/more' },
  ];

  return (
    <>
      {/* 🚨 شريط التشخيص الأحمر: إذا لم تراه، فأنت لم ترفع الكود! */}
      <div className="fixed top-16 left-0 bg-red-600 text-white text-xs px-2 py-1 z-[9999] font-mono w-full text-center">
         DEBUG HASH: {debugUrl}
      </div>

      <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe fixed bottom-0 w-full z-50">
        {navItems.map((item) => {
          // فحص قسري حرفي (Brute Force)
          const isActive = debugUrl === item.match || (item.match === '#/' && (debugUrl === '' || debugUrl === '#'));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
