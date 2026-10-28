import { NavLink } from 'react-router-dom';
import { Home, Fuel, Wrench, Wallet, Menu } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/fuel', icon: Fuel, label: 'الوقود' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/more', icon: Menu, label: 'المزيد' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 flex justify-around items-center h-16 z-50 pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-brand-500' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
