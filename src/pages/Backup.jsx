import { dbService } from '../services/dbService';
import { Download, Upload, Shield } from 'lucide-react';

export default function Backup() {
  const exportData = () => {
    const data = {
      car: JSON.parse(localStorage.getItem('savedCar')),
      fuel: dbService.getFuel(),
      expenses: dbService.getExpenses(),
      maintenance: dbService.getMaintenance(),
      documents: dbService.getDocuments()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DriveLife-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">النسخ الاحتياطي</h1>
      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 text-[var(--success)]">
          <Shield size={24} />
          <h2 className="text-lg font-bold">حماية البيانات</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          بياناتك محفوظة على هاتفك فقط. قم بتصديرها كملف احتياطي لضمان عدم ضياعها إذا قمت بتغيير هاتفك أو مسح المتصفح.
        </p>
        <div className="space-y-3">
          <button onClick={exportData} className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            <Download size={18} /> تصدير البيانات (JSON)
          </button>
          <button className="w-full bg-[var(--surface-2)] text-[var(--text-muted)] font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
            <Upload size={18} /> استيراد البيانات (قريباً)
          </button>
        </div>
      </div>
    </div>
  );
}
