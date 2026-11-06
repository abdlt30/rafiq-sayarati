import { useContext } from 'react'; // 1. إضافة استدعاء useContext
import { AppContext } from '../context/AppContext'; // 2. استدعاء الـ Context
import { Link } from 'react-router-dom';
import { FileText, Bell, Database, Settings, Info, ChevronLeft, ChevronRight } from 'lucide-react';

export default function More() {
  const { t, lang } = useContext(AppContext); // 3. جلب الترجمة واللغة

  const menuItems = [
    { path: '/documents', icon: FileText, label: t('documents') || 'الوثائق', color: '#a78bfa' },
    { path: '/reminders', icon: Bell, label: t('reminders') || 'التذكيرات', color: '#f59e0b' },
    { path: '/backup', icon: Database, label: t('backup') || 'النسخ الاحتياطي', color: '#22c55e' },
    { path: '/settings', icon: Settings, label: t('settings') || 'الإعدادات', color: '#64748b' },
    { path: '/about', icon: Info, label: t('aboutApp') || 'حول التطبيق', color: '#3b82f6' },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">{t('more') || 'المزيد'}</h1>
      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--surface-2)]" style={{ color: item.color }}><item.icon size={20} /></div>
              <span className="text-[var(--text)] font-medium">{item.label}</span>
            </div>
            {/* 4. تغيير اتجاه السهم حسب اللغة */}
            {lang === 'ar' ? (
              <ChevronLeft className="text-[var(--text-muted)]" size={20} />
            ) : (
              <ChevronRight className="text-[var(--text-muted)]" size={20} />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
