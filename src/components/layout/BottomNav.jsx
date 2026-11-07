import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);
  // قراءة الرابط الحالي من المتصفح مباشرة
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  // الاستماع لأي تغيير في الرابط وتحديث الحالة فوراً
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { path: '#/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '#/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '#/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '#/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '#/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe">
      {navItems.map((item) => {
        // فحص قسري: هل المسار الحالي يطابق الزر؟
        // نتحقق من '/' و '' لأن بعض المتصفحات تحذف الـ #
        const isActive = currentPath === item.path || (item.path === '#/' && (currentPath === '' || currentPath === '#'));
        
        return (
          <a
            key={item.path}
            href={item.path}
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
