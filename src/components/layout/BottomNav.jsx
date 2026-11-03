import { NavLink } from 'react-router-dom';
import { Home, Wallet, Wrench, Fuel, Menu } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/fuel', icon: Fuel, label: 'الوقود' },
    { path: '/more', icon: Menu, label: 'المزيد' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-dl-surface/90 backdrop-blur-lg border-t border-dl-border flex justify-around items-center z-50 pb-safe md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-dl-primary' : 'text-dl-muted hover:text-dl-text'
            }`
          }
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
