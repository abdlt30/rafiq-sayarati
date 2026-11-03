import { Link } from 'react-router-dom';
import { Settings, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md px-4 py-4 flex justify-between items-center" style={{ backgroundColor: 'rgba(7, 11, 20, 0.8)', borderBottom: '1px solid var(--border)' }}>
      
      {/* الأيقونات على اليسار */}
      <div className="flex items-center gap-3">
        <Link to="/settings" className="p-2 rounded-xl border border-slate-700/50 text-slate-300">
          <Settings size={20} />
        </Link>
        <Link to="/notifications" className="p-2 rounded-xl border border-slate-700/50 text-slate-300 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </Link>
      </div>

      {/* الشعار على اليمين */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-white">DriveLife</span>
        <div className="text-white">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M3 17v-4l2-6h11l3 6h2v4"/><path d="M5 7h9"/></svg>
        </div>
      </div>
    </header>
  );
}
