import { NavLink } from 'react-router-dom';
import { Home, Car, Wallet, Fuel, Wrench, FileText, Bell, Settings, PieChart } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/vehicles', icon: Car, label: 'سياراتي' },
    { path: '/expenses', icon: Wallet, label: 'المصاريف' },
    { path: '/fuel', icon: Fuel, label: 'الوقود' },
    { path: '/maintenance', icon: Wrench, label: 'الصيانة' },
    { path: '/documents', icon: FileText, label: 'الوثائق' },
    { path: '/reminders', icon: Bell, label: 'التنبيهات' },
    { path: '/reports', icon: PieChart, label: 'التقارير' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path><path d="M3 17v-4l2-6h11l3 6h2v4"></path><path d="M5 7h9"></path></svg>
        </div>
        <div>
          <div className="brand-name">DriveLife</div>
          <div className="brand-sub">v1.0.0</div>
        </div>
      </div>
      
      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <item.icon />
          <span>{item.label}</span>
        </NavLink>
      ))}
      
      <div className="sidebar-foot" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings />
          <span>الإعدادات</span>
        </NavLink>
      </div>
    </aside>
  );
}
