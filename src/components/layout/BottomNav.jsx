import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Home, Wallet, Wrench, FileText, Menu } from 'lucide-react';

export default function BottomNav() {
  const { t } = useContext(AppContext);
  
  // قراءة الرابط الحقيقي من المتصفح مباشرة (بدون أي مكتبات)
  const currentUrl = window.location.href;

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '/more', icon: Menu, label: t('more') || 'المزيد' },
  ];

  return (
    <nav className="flex justify-around items-center h-16 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]">
      {navItems.map((item) => {
        // 🚨 الفحص القسري: هل الرابط الحالي يحتوي على مسار الزر؟
        let active = false;
        
        if (item.path === '/') {
          // إذا كنا في الرئيسية، يجب ألا يحتوي الرابط على أي مسار آخر
          active = !currentUrl.includes('#/fuel') && 
                   !currentUrl.includes('#/expenses') && 
                   !currentUrl.includes('#/maintenance') && 
                   !currentUrl.includes('#/documents') && 
                   !currentUrl.includes('#/more');
        } else {
          // للصفحات الأخرى، نتحقق مما إذا كان الرابط يحتوي عليها
          active = currentUrl.includes(`#${item.path}`);
        }

        return (
          <a
            key={item.path}
            href={`#${item.path}`} // استخدام وسم a العادي لتغيير الرابط
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
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
