import { useContext, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Download, Upload, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Backup() {
  const { t } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState({ type: '', message: '' }); // لحالة النجاح أو الفشل

  // دالة تصدير البيانات
  const exportData = () => {
    try {
      const data = {
        car: JSON.parse(localStorage.getItem('savedCar')),
        vehicles: JSON.parse(localStorage.getItem('vehicles')) || [],
        fuel: dbService.getFuel(),
        expenses: dbService.getExpenses(),
        maintenance: dbService.getMaintenance(),
        documents: dbService.getDocuments(),
        reminders: dbService.getReminders(), // تمت إضافة التذكيرات
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RafiqSayarati-Backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: t('exportSuccess') || 'تم تصدير البيانات بنجاح!' });
    } catch (error) {
      setStatus({ type: 'error', message: 'حدث خطأ أثناء تصدير البيانات.' });
    }
  };

  // دالة استيراد البيانات
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // التحقق من صحة الملف (هل يحتوي على بيانات السيارات على الأقل؟)
        if (!data.vehicles && !data.car) {
          throw new Error("ملف غير صالح");
        }

        if (window.confirm(t('confirmImport') || 'تحذير: سيتم استبدال جميع بياناتك الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
          if (data.car) localStorage.setItem('savedCar', JSON.stringify(data.car));
          if (data.vehicles) localStorage.setItem('vehicles', JSON.stringify(data.vehicles));
          
          // حفظ بيانات الـ dbService
          if (data.fuel) localStorage.setItem('fuel_records', JSON.stringify(data.fuel));
          if (data.expenses) localStorage.setItem('expenses_records', JSON.stringify(data.expenses));
          if (data.maintenance) localStorage.setItem('maintenance_records', JSON.stringify(data.maintenance));
          if (data.documents) localStorage.setItem('documents_records', JSON.stringify(data.documents));
          if (data.reminders) localStorage.setItem('reminders_records', JSON.stringify(data.reminders));

          alert(t('importSuccess') || 'تم استيراد البيانات بنجاح! سيتم إعادة تشغيل التطبيق لتحديث الواجهة.');
          window.location.reload(); // إعادة التشغيل لتحديث الـ Context
        }
      } catch (error) {
        setStatus({ type: 'error', message: t('importError') || 'خطأ: الملف غير صالح أو تالف.' });
      }
    };
    reader.readAsText(file);
    // تصفير الحقل ليتمكن المستخدم من اختيار نفس الملف مرة أخرى إذا أراد
    e.target.value = null; 
  };

  return (
    <div className="space-y-4 pb-24 px-4 max-w-4xl mx-auto">
      
      {/* الشريط العلوي الثابت */}
      <div className="sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('backup') || 'النسخ الاحتياطي'}</h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 text-[var(--success)]">
          <Shield size={28} />
          <h2 className="text-lg font-bold text-[var(--text)]">{t('dataProtection') || 'حماية البيانات'}</h2>
        </div>
        
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {t('backupDesc') || 'بياناتك محفوظة على هاتفك فقط. قم بتصديرها كملف احتياطي لضمان عدم ضياعها إذا قمت بتغيير هاتفك أو مسح المتصفح.'}
        </p>

        {/* رسائل الحالة */}
        {status.message && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-bold ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {status.message}
          </div>
        )}

        <div className="space-y-3 pt-2">
          {/* زر التصدير */}
          <button 
            onClick={exportData} 
            className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Download size={18} /> {t('exportData') || 'تصدير البيانات (JSON)'}
          </button>
          
          {/* زر الاستيراد */}
          <input 
            type="file" 
            accept=".json,application/json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="w-full bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--border)] transition-colors"
          >
            <Upload size={18} /> {t('importData') || 'استيراد البيانات'}
          </button>
        </div>
      </div>
    </div>
  );
}
