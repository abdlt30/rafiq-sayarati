import { useContext } from 'react'; // 1. إضافة استدعاء useContext
import { AppContext } from '../../context/AppContext.jsx';
import { NavLink } from 'react-router-dom';
// 3. حذف الأيقونات غير المستخدمة (PieChart, Database)
import { Home, Car, Wallet, Fuel, Wrench, FileText, Bell, Settings } from 'lucide-react';

export default function Sidebar() {
  const { t } = useContext(AppContext); // 4. جلب دالة الترجمة

  const menu = [
    { path: '/', icon: Home, label: t('home') || 'الرئيسية' },
    { path: '/vehicles', icon: Car, label: t('vehicles') || 'سياراتي' },
    { path: '/expenses', icon: Wallet, label: t('expenses') || 'المصاريف' },
    { path: '/fuel', icon: Fuel, label: t('fuel') || 'الوقود' },
    { path: '/maintenance', icon: Wrench, label: t('maintenance') || 'الصيانة' },
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق' },
    { path: '/reminders', icon: Bell, label: t('reminders') || 'التذكيرات' },
    { path: '/settings', icon: Settings, label: t('settings') || 'الإعدادات' },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        {/* 5. استخدام متغيرات الألوان الديناميكية للشعار */}
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center font-bold text-white text-xl">
          D
        </div>
        <div>
          {/* 6. استخدام الترجمة لاسم التطبيق والألوان الديناميكية */}
          <h1 className="font-bold text-lg text-[var(--text)]">{t('appName') || 'DriveLife'}</h1>
          <p className="text-xs text-[var(--text-muted)]">v1.0.0</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' // لون ديناميكي للنشط
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]' // لون ديناميكي لغير النشط
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
