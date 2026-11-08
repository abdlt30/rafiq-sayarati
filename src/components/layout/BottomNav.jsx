import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText, Menu, Fuel } from 'lucide-react';

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
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe fixed bottom-0 w-full z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'} // 👈 يمنع الرئيسية من التوهج
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          <item.icon size={20} />
          <span className="text-[9px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
