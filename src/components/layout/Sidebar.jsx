import { NavLink } from 'react-router-dom';
import { Home, Fuel, Wrench, Wallet, Menu, FileText, Bell, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/fuel', icon: Fuel, label: 'الوقود' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/more', icon: Menu, label: 'المزيد' },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 p-6 flex flex-col border-l" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600 text-white font-bold text-xl">
          ر
        </div>
        <div>
          <h1 className="font-bold text-lg" style={{ color: 'var(--text)' }}>رفيق سيارتي</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>v1.0.0</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive ? 'bg-blue-500/10 text-blue-500' : 'text-slate-400 hover:bg-dark-800'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-dark-800 transition-colors">
          <Settings size={20} />
          <span>الإعدادات</span>
        </NavLink>
      </div>
    </aside>
  );
}
