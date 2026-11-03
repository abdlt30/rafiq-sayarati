import { Outlet, NavLink } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { Home, Wallet, Wrench, Fuel, Menu, Car, Settings } from 'lucide-react';

export default function Layout({ children }) {
  const sidebarItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/vehicles', icon: Car, label: 'سياراتي' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/fuel', icon: Fuel, label: 'الوقود' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="flex min-h-screen bg-dl-bg">
      {/* الشريط الجانبي (للشاشات الكبيرة) */}
      <aside className="hidden md:flex flex-col w-[250px] bg-dl-surface border-l border-dl-border p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8 px-2 text-dl-primary">
          <div className="w-10 h-10 bg-dl-primary rounded-xl flex items-center justify-center text-white">
            <Car size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-dl-text">DriveLife</h1>
            <p className="text-[10px] text-dl-muted">الإصدار 1.4.4</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-dl-primary/10 text-dl-primary font-bold' 
                    : 'text-dl-muted hover:bg-dl-surface2 hover:text-dl-text'
                }`
              }
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6">
          {children || <Outlet />}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
