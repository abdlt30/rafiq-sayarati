import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wallet } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <header className="bg-dark-800 p-4 sticky top-0 z-10 border-b border-dark-700">
        <h1 className="text-xl font-bold text-center">رفيق سيارتي</h1>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-dark-800 border-t border-dark-700 flex justify-around items-center h-16 z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 w-full h-full justify-center ${isActive ? 'text-brand-500' : 'text-gray-400'}`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
