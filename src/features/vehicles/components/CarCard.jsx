import { useContext } from 'react';
// ✅ 1. تحديث المسار (الصعود 3 مستويات)
import { AppContext } from '../../../context/AppContext.jsx';
import { NavLink } from 'react-router-dom';
import { Home, Fuel, Wrench, Wallet, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/fuel', icon: Fuel, label: t('fuel') || 'الوقود' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    // ✅ 2. تم إزالة fixed, border-t, pb-safe لأن Layout.jsx يتحكم بها
    <nav 
      className="flex justify-around items-center h-16 w-full bg-[var(--surface)]/95 backdrop-blur-md" 
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          // 👈 السطر السحري: يمنع الرئيسية من التوهج في الصفحات الأخرى
          end={item.path === '/'} 
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
