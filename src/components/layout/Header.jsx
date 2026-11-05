import { Link } from 'react-router-dom';
import { Settings, Bell, Car } from 'lucide-react';

export default function Header() {
  return (
    <div className="page-head" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Car size={24} color="var(--primary)" />
        <h1 className="page-title" style={{ fontSize: '20px', fontWeight: '800' }}>DriveLife</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link to="/notifications" className="icon-btn" style={{ background: 'var(--surface-2)', padding: '8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <Bell size={20} />
        </Link>
        <Link to="/settings" className="icon-btn" style={{ background: 'var(--surface-2)', padding: '8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <Settings size={20} />
        </Link>
      </div>
    </div>
  );
}
