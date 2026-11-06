import { useContext } from 'react'; // 1. إضافة استدعاء useContext
import { AppContext } from '../context/AppContext'; // 2. استدعاء الـ Context
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext); // 3. جلب دالة الترجمة

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    // 4. استخدام متغيرات الألوان الديناميكية
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
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
