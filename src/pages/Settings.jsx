import React from 'react';
import { db } from '../db/database';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const exportData = async () => {
    try {
      const vehicles = await db.vehicles.toArray();
      const expenses = await db.expenses.toArray();
      const maintenance = await db.maintenance.toArray();
      const documents = await db.documents.toArray();

      const backupData = { vehicles, expenses, maintenance, documents };
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
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-white">الإعدادات</h1>

      <div className="bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden">
        <div className="p-4 border-b border-dark-700">
          <h3 className="text-slate-400 text-sm mb-2">النسخ الاحتياطي</h3>
          <p className="text-xs text-slate-500 mb-4">قم بتصدير بياناتك كملف JSON للاحتفاظ بها.</p>
          <button onClick={exportData} className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition">
            <Download size={18} /> تصدير البيانات
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-red-400 text-sm mb-2">منطقة الخطر</h3>
          <button onClick={clearData} className="w-full bg-red-500/10 text-red-500 border border-red-500/30 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition">
            <Trash2 size={18} /> مسح جميع البيانات
          </button>
        </div>
      </div>
    </div>
  );
      }
