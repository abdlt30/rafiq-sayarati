import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { Home, Fuel, Wrench, Wallet, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext); // ✅ استعادة الترجمة

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/fuel', icon: Fuel, label: t('fuel') || 'الوقود' }, // ✅ إضافة ممتازة منك
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe">
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
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
