import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);
  
  // 1. قراءة المسار الحالي مباشرة من المتصفح (بدون React Router)
  const [activePath, setActivePath] = useState(window.location.hash.replace('#', '') || '/');

  // 2. مراقبة أي تغيير في الرابط وتحديث الحالة فوراً
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || '/';
      setActivePath(path);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    // تم تثبيت الشريط في الأسفل لضمان عدم تحركه
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe fixed bottom-0 w-full z-50">
      {navItems.map((item) => {
        // 3. الفحص المباشر: هل المسار الحالي يطابق الزر؟
        const isActive = activePath === item.path || (item.path === '/' && activePath === '');

        return (
          <a
            key={item.path}
            href={`#${item.path}`} // استخدام وسم a العادي
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
