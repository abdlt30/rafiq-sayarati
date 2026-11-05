import { Link } from 'react-router-dom';
import { FileText, Bell, Database, Settings, Info } from 'lucide-react';

export default function More() {
  const menuItems = [
    { path: '/documents', icon: FileText, label: 'الوثائق', color: '#a78bfa' },
    { path: '/reminders', icon: Bell, label: 'التذكيرات', color: '#f59e0b' },
    { path: '/backup', icon: Database, label: 'النسخ الاحتياطي', color: '#22c55e' }, // مسار جديد
    { path: '/settings', icon: Settings, label: 'الإعدادات', color: '#64748b' }, // مسار الإعدادات
    { path: '/about', icon: Info, label: 'حول التطبيق', color: '#3b82f6' },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">المزيد</h1>
      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-2)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--surface-2)]" style={{ color: item.color }}><item.icon size={20} /></div>
              <span className="text-[var(--text)] font-medium">{item.label}</span>
            </div>
            <span className="text-[var(--text-muted)]">←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
