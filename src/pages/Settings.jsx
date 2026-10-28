import React from 'react';
import { db } from '../db/database';
import { Download, Trash2, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  const exportData = async () => {
    try {
      const vehicles = await db.vehicles.toArray();
      const expenses = await db.expenses.toArray();
      const maintenance = await db.maintenance.toArray();
      const documents = await db.documents.toArray();
      const fuel = await db.fuel.toArray();

      const backupData = { vehicles, expenses, maintenance, documents, fuel };
      const jsonString = JSON.stringify(backupData, null, 2);
      
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rafiq-sayarati-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data", error);
      alert("حدث خطأ أثناء التصدير");
    }
  };

  const clearData = async () => {
    if (window.confirm("تحذير: سيتم حذف جميع البيانات نهائياً. هل أنت متأكد؟")) {
      await db.vehicles.clear();
      await db.expenses.clear();
      await db.maintenance.clear();
      await db.documents.clear();
      await db.fuel.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* زر الرجوع */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/more')} className="p-2 bg-dark-800 rounded-full text-white">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
      </div>

      <div className="bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden">
        
        {/* النسخ الاحتياطي */}
        <div className="p-5 border-b border-dark-700">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-green-500" />
            <h3 className="font-bold text-white">النسخ الاحتياطي</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            بياناتك محفوظة على هاتفك فقط. قم بتصديرها كملف احتياطي لضمان عدم ضياعها إذا قمت بتغيير هاتفك.
          </p>
          <button onClick={exportData} className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition">
            <Download size={18} /> تصدير البيانات (JSON)
          </button>
        </div>

        {/* منطقة الخطر */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 size={20} className="text-red-500" />
            <h3 className="font-bold text-red-500">منطقة الخطر</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            سيتم مسح جميع السيارات، المصاريف، سجلات الصيانة، والوثائق نهائياً. لا يمكن التراجع.
          </p>
          <button onClick={clearData} className="w-full bg-red-500/10 text-red-500 border border-red-500/30 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition">
            <Trash2 size={18} /> مسح جميع البيانات
          </button>
        </div>

      </div>

      <div className="text-center text-xs text-slate-500 mt-8">
        <p>رفيق سيارتي - الإصدار 1.0.0</p>
        <p className="mt-1">صُنع بكل حب للمستخدم العربي</p>
      </div>
    </div>
  );
}
