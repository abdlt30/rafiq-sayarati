import { NavLink } from 'react-router-dom';
import { Home, Fuel, Wrench, Wallet, Menu } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/fuel', icon: Fuel, label: 'الوقود' },
    { path: '/more', icon: Menu, label: 'المزيد' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-20 pb-safe" style={{ backgroundColor: 'rgba(14, 21, 38, 0.95)', backdropFilter: 'blur(18px)', borderTop: '1px solid var(--border)' }}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-blue-500' : 'text-slate-400'
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
