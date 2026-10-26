import React from 'react';
import { ArrowLeft, Shield, TrendingUp } from 'lucide-react';

export default function Welcome({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-gradient-to-b from-dark-900 to-dark-800">
      {/* الشعار */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 mt-10">
        <div className="w-24 h-24 bg-brand-500 rounded-3xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
          <Shield size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">رفيق سيارتي</h1>
        <p className="text-slate-400 text-lg max-w-xs leading-relaxed">
          سيارتك، بياناتك، وراحة بالك. كل شيء في مكان واحد، يعمل بدون إنترنت.
        </p>
      </div>

      {/* الميزات */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 bg-dark-700/50 p-4 rounded-2xl">
          <TrendingUp className="text-accent-500" />
          <span className="text-sm">تتبع المصاريف والصيانة بدقة</span>
        </div>
        <div className="flex items-center gap-3 bg-dark-700/50 p-4 rounded-2xl">
          <Shield className="text-brand-500" />
          <span className="text-sm">تذكيرات ذكية للتأمين والفحص</span>
        </div>
      </div>

      {/* زر البدء */}
      <button 
        onClick={onStart}
        className="w-full bg-brand-500 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30"
      >
        ابدأ الآن (مجاناً)
        <ArrowLeft size={20} />
      </button>
    </div>
  );
}
