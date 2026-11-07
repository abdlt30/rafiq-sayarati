import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link, useLocation } from 'react-router-dom'; // ✅ استبدلنا NavLink بـ Link و useLocation
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);
  const location = useLocation(); // ✅ معرفة المسار الحالي

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  // ✅ دالة قسرية لتحديد ما إذا كان الزر نشطاً
  const isActive = (path) => {
    // إذا كان المسار هو الرئيسية، يجب أن يكون المسار الحالي '/' بالضبط
    if (path === '/') {
      return location.pathname === '/';
    }
    // إذا كان مساراً آخر، يكفي أن يبدأ المسار الحالي به
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]">
      {navItems.map((item) => {
        const active = isActive(item.path); // حساب الحالة
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
