import { Link } from 'react-router-dom';
import { Car, Bell, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-dl-bg/80 backdrop-blur-md border-b border-dl-border px-4 py-3 flex justify-between items-center">
      {/* الشعار */}
      <Link to="/" className="flex items-center gap-2 text-dl-primary">
        <div className="w-8 h-8 bg-dl-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-dl-primary/40">
          <Car size={18} />
        </div>
        <span className="font-bold text-lg text-dl-text">DriveLife</span>
      </Link>

      {/* الأزرار */}
      <div className="flex gap-2">
        <Link to="/more" className="p-2 rounded-xl bg-dl-surface border border-dl-border text-dl-muted hover:text-dl-text transition-colors">
          <Bell size={18} />
        </Link>
        <Link to="/settings" className="p-2 rounded-xl bg-dl-surface border border-dl-border text-dl-muted hover:text-dl-text transition-colors">
          <Settings size={18} />
        </Link>
      </div>
    </header>
  );
}
