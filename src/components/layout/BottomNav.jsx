import { useState, useEffect } from 'react';
import { Home, Wallet, Wrench, FileText, Menu, Fuel } from 'lucide-react';

export default function BottomNav() {
  // حالة لتخزين الرابط الحالي
  const [hash, setHash] = useState(window.location.hash || '#/');

  // مراقبة أي تغيير في الرابط (حتى لو حدث من خارج المكون)
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { path: '#/', icon: Home, label: 'الرئيسية' },
    { path: '#/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '#/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '#/fuel', icon: Fuel, label: 'سجل الوقود' }, // الأيقونة التي أضفتها
    { path: '#/more', icon: Menu, label: 'المزيد' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe">
      {navItems.map((item) => {
        // فحص قسري حرفي: هل الرابط الحالي يطابق مسار الزر؟
        // نستخدم startsWith لتغطية المسارات الفرعية
        const isActive = hash === item.path;

        return (
          <a
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-medium">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
