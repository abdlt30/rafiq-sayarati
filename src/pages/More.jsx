import { Link } from 'react-router-dom';
import { Car, Database, Settings, Info, FileText, Bell } from 'lucide-react';

export default function More() {
  const menuItems = [
    { path: '/documents', icon: FileText, label: 'الوثائق', color: 'text-purple-400' },
    { path: '/reminders', icon: Bell, label: 'التذكيرات', color: 'text-yellow-400' },
    { path: '/settings', icon: Database, label: 'النسخ الاحتياطي', color: 'text-green-400' },
    { path: '/settings', icon: Settings, label: 'الإعدادات', color: 'text-slate-400' },
    { path: '/settings', icon: Info, label: 'حول التطبيق', color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-white mb-6">المزيد</h1>
      <div className="card p-0 overflow-hidden">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="flex items-center justify-between p-4 border-b border-dark-700 last:border-0 hover:bg-dark-700/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-dark-900 ${item.color}`}><item.icon size={20} /></div>
              <span className="text-slate-200 font-medium">{item.label}</span>
            </div>
            <span className="text-slate-500">←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
