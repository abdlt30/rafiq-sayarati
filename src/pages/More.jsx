import { Link } from 'react-router-dom';
import { Car, Bell, Database, Settings, Info, FileText } from 'lucide-react';

export default function More() {
  const items = [
    { path: '/documents', icon: FileText, label: 'الوثائق', color: '#a78bfa' },
    { path: '/reminders', icon: Bell, label: 'التذكيرات', color: '#f59e0b' },
    { path: '/settings', icon: Database, label: 'النسخ الاحتياطي', color: '#22c55e' },
    { path: '/settings', icon: Settings, label: 'الإعدادات', color: '#64748b' },
    { path: '/settings', icon: Info, label: 'حول التطبيق', color: '#3b82f6' },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>المزيد</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, index) => (
          <Link key={index} to={item.path} className="row" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '10px', color: item.color }}>
              <item.icon size={20} />
            </div>
            <span style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{item.label}</span>
            <span style={{ color: 'var(--text-muted)' }}>←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
