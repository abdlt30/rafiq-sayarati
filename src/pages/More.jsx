import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Settings, Info, Shield, Download, ChevronLeft } from 'lucide-react';

export default function More() {
  const menuItems = [
    { 
      path: '/documents', 
      icon: FileText, 
      label: 'الوثائق', 
      desc: 'إدارة وثائق السيارة والتأمين',
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'الإعدادات', 
      desc: 'النسخ الاحتياطي، اللغة، والبيانات',
      color: 'text-slate-400', 
      bg: 'bg-slate-500/10' 
    },
    { 
      path: '/about', 
      icon: Info, 
      label: 'حول التطبيق', 
      desc: 'الإصدار والمعلومات',
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10' 
    },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">المزيد</h1>

      <div className="bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 hover:bg-dark-700 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-dark-700' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}>
                <Icon size={22} className={item.color} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
              <ChevronLeft size={20} className="text-slate-500" />
            </Link>
          );
        })}
      </div>

      {/* قسم النسخ الاحتياطي (للمستقبل) */}
      <div className="bg-dark-800 p-5 rounded-3xl border border-dark-700 mt-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={18} className="text-green-500" />
          <h3 className="font-bold text-white">النسخ الاحتياطي</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">احتفظ ببياناتك آمنة. يمكنك تصديرها لاحقاً.</p>
        <button className="w-full bg-dark-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
          <Download size={18} /> تصدير البيانات (قريباً)
        </button>
      </div>
    </div>
  );
}
