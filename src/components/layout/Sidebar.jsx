import { NavLink } from 'react-router-dom';
import { Home, Car, Wallet, Fuel, Wrench, FileText, Bell, Settings, PieChart, Database } from 'lucide-react';

export default function Sidebar() {
  const menu = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/vehicles', icon: Car, label: 'سياراتي' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/fuel', icon: Fuel, label: 'الوقود' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/documents', icon: FileText, label: 'الوثائق' },
    { path: '/reminders', icon: Bell, label: 'التذكيرات' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl">D</div>
        <div>
          <h1 className="font-bold text-lg text-white">DriveLife</h1>
          <p className="text-xs text-slate-400">v1.0.0</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                isActive ? 'bg-blue-500/10 text-blue-500' : 'text-slate-400 hover:bg-[#141d33]'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
