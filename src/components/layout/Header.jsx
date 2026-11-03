import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 px-4 py-4 flex justify-between items-center">
      <Link to="/more" className="text-slate-400 hover:text-white transition-colors">
        <Settings size={20} />
      </Link>
      <div className="text-brand-500 font-bold text-lg">رفيق سيارتي</div>
    </header>
  );
}
