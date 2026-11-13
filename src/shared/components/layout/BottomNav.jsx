import { useContext, useMemo } from 'react';
// ✅ المسار صحيح (3 مستويات للخلف)
import { AppContext } from '../../../context/AppContext.jsx';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Wrench, Menu, Fuel } from 'lucide-react'; 

export default function BottomNav() {
  const { t } = useContext(AppContext);

  // ✅ 1. استخدام useMemo لتحسين الأداء
  const navItems = useMemo(() => [
    { path: '/', icon: Home, label: t('home') },
    { path: '/fuel', icon: Fuel, label: t('fuel') },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') },
    { path: '/expenses', icon: Wallet, label: t('expenses') },
    { path: '/more', icon: Menu, label: t('more') },
  ], [t]);

  return (
    // ✅ 2. بدون fixed أو border-t (Layout.jsx يتكفل بهما)
    <nav className="flex justify-around items-center h-16 w-full bg-[var(--surface)]/95 backdrop-blur-md" aria-label="Mobile Navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* مؤشر التحديد العلوي (Active Indicator) */}
              {isActive && (
                <span className="absolute top-0 w-8 h-[3px] rounded-b-md bg-[var(--primary)] transition-all duration-300"></span>
              )}
              
              {/* الأيقونة والنص */}
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} 
              />
              <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
