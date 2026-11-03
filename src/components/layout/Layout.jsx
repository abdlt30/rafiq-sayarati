import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText, Menu, Car, Settings, Bell } from 'lucide-react';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/vehicles', icon: Car, label: 'سياراتي' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/fuel', icon: FuelIcon, label: 'الوقود' }, // سنستخدم أيقونة مخصصة
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/documents', icon: FileText, label: 'الوثائق' },
    { path: '/notifications', icon: Bell, label: 'التنبيهات' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="flex min-h-screen bg-dl-bg">
      {/* Sidebar (للشاشات الكبيرة) */}
      <aside className="hidden md:flex flex-col w-64 bg-dl-surface border-l border-dl-border p-4 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 px-2 text-dl-primary">
          <div className="w-10 h-10 bg-dl-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-dl-primary/40">
            <Car size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-dl-text">DriveLife</h1>
            <p className="text-[10px] text-dl-muted">رفيق سيارتي</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-dl-primary/10 text-dl-primary font-bold' 
                    : 'text-dl-muted hover:bg-dl-surface2 hover:text-dl-text'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header /> {/* الشريط العلوي */}
        
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
          {children || <Outlet />}
        </main>
        
        <BottomNav /> {/* شريط التنقل السفلي (للموبايل) */}
      </div>
    </div>
  );
}

// أيقونة وقود مخصصة (لأن Lucide لا تحتوي على مضخة وقود مباشرة)
function FuelIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="22" x2="15" y2="22"></line>
      <line x1="4" y1="9" x2="14" y2="9"></line>
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path>
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path>
    </svg>
  );
}
