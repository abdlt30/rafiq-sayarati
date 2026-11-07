import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);

  // 🔍 قراءة الرابط الحقيقي من المتصفح (يدعم HashRouter)
  const currentHash = window.location.hash || '#/';

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  // ✅ دالة القبول والرفض القسرية
  const isActive = (path) => {
    // إذا كان المسار هو الرئيسية، يجب أن يكون الرابط '#/' بالضبط ولا شيء غيره
    if (path === '/') {
      return currentHash === '#/' || currentHash === '#' || currentHash === '';
    }
    // للروابط الأخرى، نتحقق مما إذا كان الرابط يحتوي عليها
    return currentHash.includes(path);
  };

  return (
    <>
      {/* 🚨 شريط التشخيص: إذا لم ترى هذا الشريط الأحمر في أعلى شاشتك، فأنت لم تقم بتحديث الكود! */}
      <div className="fixed top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 z-[9999] font-mono">
        DEBUG Hash: {currentHash}
      </div>

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
    </>
  );
}
