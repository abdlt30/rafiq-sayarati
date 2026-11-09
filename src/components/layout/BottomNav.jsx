import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Wrench, Menu, Fuel } from 'lucide-react'; // ✅ تم حذف FileText غير المستخدم

export default function BottomNav() {
  const { t } = useContext(AppContext);

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/fuel', icon: Fuel, label: t('fuel') || 'سجل الوقود' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    // ✅ إصلاح: إزالة fixed و bottom-0 و pb-safe لأنها موجودة في Layout.jsx لتجنب التضارب
    <nav className="flex justify-around items-center h-16 w-full bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* ✅ الخط العلوي (Active Indicator) - تصميم احترافي */}
              {isActive && (
                <span className="absolute top-0 w-8 h-[3px] rounded-b-md bg-[var(--primary)] transition-all duration-300"></span>
              )}
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'scale-110 transition-transform' : ''} />
              <span className="text-[10px] font-bold mt-1">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
