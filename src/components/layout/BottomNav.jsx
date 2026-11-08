import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);
  
  // قراءة الرابط الحقيقي من المتصفح مباشرة
  const currentUrl = window.location.href;

  const navItems = [
    { path: '#/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '#/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '#/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '#/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '#/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] pb-safe fixed bottom-0 w-full z-50">
      {navItems.map((item) => {
        // فحص قسري سافر: هل الرابط الحالي يحتوي على هذا المسار؟
        let isActive = false;
        
        if (item.path === '#/') {
          // الرئيسية مضيئة فقط إذا لم يكن هناك أي مسار آخر في الرابط
          isActive = !currentUrl.includes('#/expenses') && 
                     !currentUrl.includes('#/maintenance') && 
                     !currentUrl.includes('#/documents') && 
                     !currentUrl.includes('#/more') && 
                     !currentUrl.includes('#/fuel');
        } else {
          isActive = currentUrl.includes(item.path);
        }

        return (
          <a
            key={item.path}
            href={item.path} // استخدام <a> العادي لتحديث الرابط
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
