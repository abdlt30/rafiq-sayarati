import { useNavigate } from 'react-router-dom';
import { Car, Database, Settings, Info, Shield, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function More() {
  const navigate = useNavigate();
  const { setCurrentCar } = useContext(AppContext);

  const menuItems = [
    { icon: Car, label: 'إدارة السيارة', path: '/add-vehicle', color: 'text-blue-400' },
    { icon: Database, label: 'النسخ الاحتياطي', path: '/settings', color: 'text-green-400' },
    { icon: Settings, label: 'الإعدادات', path: '/settings', color: 'text-slate-400' },
    { icon: Info, label: 'حول التطبيق', path: '/settings', color: 'text-purple-400' },
  ];

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من حذف السيارة والبيانات؟')) {
      localStorage.removeItem('savedCar');
      setCurrentCar(null);
      navigate('/welcome');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-white mb-6">المزيد</h1>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between p-4 border-b border-dark-700 last:border-0 hover:bg-dark-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-dark-900 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="text-slate-200 font-medium">{item.label}</span>
            </div>
            <span className="text-slate-500">←</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
      >
        <LogOut size={20} />
        <span className="font-bold">حذف السيارة والبيانات</span>
      </button>

      <p className="text-center text-slate-500 text-xs mt-8">الإصدار 1.0.0</p>
    </div>
  );
}
