import { Link } from 'react-router-dom';
import { Settings, Bell, Car } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-[#070b14] border-b border-[#1e2a44]">
      <div className="flex items-center gap-2 text-white font-bold text-xl">
        <Car className="text-blue-500" size={24} />
        <span>DriveLife</span>
      </div>
      <div className="flex gap-3">
        <Link to="/reminders" className="p-2 rounded-xl bg-[#141d33] text-slate-300 hover:text-white"><Bell size={20} /></Link>
        <Link to="/settings" className="p-2 rounded-xl bg-[#141d33] text-slate-300 hover:text-white"><Settings size={20} /></Link>
      </div>
    </header>
  );
}
