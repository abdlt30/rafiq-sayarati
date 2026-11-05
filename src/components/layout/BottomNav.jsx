import { NavLink } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/documents', icon: FileText, label: 'الوثائق' },
    { path: '/more', icon: Menu, label: 'المزيد' },
  ];

  return (
    <nav className="flex justify-around items-center h-16 bg-[#0e1526]/95 backdrop-blur-md border-t border-[#1e2a44]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? 'text-blue-500' : 'text-slate-400'
            }`
          }
        >
          <item.icon size={22} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
