import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Download, Trash2, Shield, ArrowRight, Printer } from 'lucide-react'; // تمت إضافة Printer هنا

export default function Settings() {
  const navigate = useNavigate();

  const exportData = () => {
    try {
      const backupData = {
        car: JSON.parse(localStorage.getItem('savedCar')) || null,
        fuel: dbService.getFuelRecords(),
        expenses: dbService.getExpenses(),
        maintenance: dbService.getMaintenance()
      };

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

  const clearData = () => {
    if (window.confirm("تحذير: سيتم حذف جميع البيانات نهائياً. هل أنت متأكد؟")) {
      localStorage.removeItem('savedCar');
      localStorage.removeItem('fuel_records');
      localStorage.removeItem('expenses_records');
      localStorage.removeItem('maintenance_records');
      
      window.location.href = '/#/welcome';
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
          
          {/* زر الطباعة */}
          <button onClick={() => window.print()} className="w-full mt-2 bg-dark-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-dark-600 transition">
            <Printer size={18} /> طباعة التقرير (PDF)
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
