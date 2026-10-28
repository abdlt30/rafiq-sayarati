import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/documents', icon: FileText, label: 'الوثائق' }, // <-- تفعيلها هنا
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-dark-900">
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-dark-800 border-t border-dark-700 flex justify-around items-center h-20 z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 w-full h-full justify-center ${isActive ? 'text-brand-500' : 'text-slate-500'}`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
