import { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { NavLink } from 'react-router-dom';
import { Home, Car, Wallet, Fuel, Wrench, FileText, Bell, Settings } from 'lucide-react';

export default function Sidebar() {
  const { t } = useContext(AppContext);

  // ✅ 1. استخدام useMemo لمنع إعادة بناء القائمة في كل مرة
  const menu = useMemo(() => [
    { path: '/', icon: Home, label: t('home'), end: true }, // ✅ إضافة end
    { path: '/vehicles', icon: Car, label: t('vehicles') },
    { path: '/expenses', icon: Wallet, label: t('expenses') },
    { path: '/fuel', icon: Fuel, label: t('fuel') },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') },
    { path: '/documents', icon: FileText, label: t('documents') },
    { path: '/reminders', icon: Bell, label: t('reminders') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ], [t]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center font-bold text-white text-xl shadow-md">
          D
        </div>
        <div>
          <h1 className="font-bold text-lg text-[var(--text)] leading-tight">
            {t('appName')}
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">v1.0.0</p>
        </div>
      </div>
      
      {/* ✅ 2. إضافة aria-label للقائمة لتحسين الوصول */}
      <nav className="flex-1 space-y-1.5" aria-label="Main Navigation">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end} // ✅ تفعيل التطابق التام للصفحة الرئيسية
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                isActive 
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-sm' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] font-medium'
              }`
            }
          >
            {/* ✅ 3. إضافة active لسمك الأيقونة عند التحديد */}
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* مساحة اختيارية لإضافة زر "تسجيل الخروج" أو معلومات أسفل القائمة */}
      <div className="mt-auto pt-4 border-t border-[var(--border)]">
        <p className="text-[10px] text-center text-[var(--text-muted)]">© {new Date().getFullYear()} Rafiq Sayarati</p>
      </div>
    </div>
  );
}
