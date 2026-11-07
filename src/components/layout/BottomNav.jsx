import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);
  const [currentPath, setCurrentPath] = useState('/');

  // دالة استخراج المسار من رابط المتصفح مباشرة
  const getBrowserPath = () => {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') return '/';
    return hash.replace('#', '');
  };

  useEffect(() => {
    // 1. ضبط المسار عند أول تحميل
    setCurrentPath(getBrowserPath());

    // 2. الاستماع لأي تغيير في رابط المتصفح (عند الضغط على أي زر)
    const handleLocationChange = () => {
      setCurrentPath(getBrowserPath());
    };

    // نستخدم الحدث الأصلي للمتصفح، ولا نعتمد على React Router إطلاقاً
    window.addEventListener('hashchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  // دالة التحديد القسرية
  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]">
      {navItems.map((item) => {
        const active = isActive(item.path);
        
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
