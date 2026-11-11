import { useContext, useRef, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Download, Upload, ShieldCheck, AlertTriangle, CheckCircle, Database, ChevronRight } from 'lucide-react';

export default function Backup() {
  const { t, lang } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [lastBackup, setLastBackup] = useState('');

  // ✅ جلب تاريخ آخر نسخة احتياطية عند فتح الصفحة
  useEffect(() => {
    const savedDate = localStorage.getItem('last_backup_date');
    if (savedDate) {
      const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
      setLastBackup(new Date(savedDate).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    }
  }, [lang]);

  // ✅ 1. دالة التصدير (محدثة لحفظ التاريخ)
  const exportData = () => {
    try {
      const data = {
        currentCar: JSON.parse(localStorage.getItem('savedCar')) || null,
        vehicles: JSON.parse(localStorage.getItem('vehicles')) || [],
        fuel: dbService.getFuel() || [],
        maintenance: dbService.getMaintenance() || [],
        expenses: dbService.getExpenses() || [],
        incomes: dbService.getIncomes() || [],
        documents: dbService.getDocuments() || [],
        reminders: dbService.getReminders() || [],
        customTypes: dbService.getCustomTypes() || [],
        settings: {
          theme: localStorage.getItem('theme') || 'dark',
          lang: localStorage.getItem('lang') || 'ar',
          currency: localStorage.getItem('currency') || 'MAD',
          user_name: localStorage.getItem('user_name') || ''
        },
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RafiqSayarati-Backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);

      // ✅ حفظ تاريخ آخر نسخة احتياطية لتحديث الواجهة
      const now = new Date().toISOString();
      localStorage.setItem('last_backup_date', now);
      const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
      setLastBackup(new Date(now).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));

      setStatus({ type: 'success', message: t('exportSuccess') || 'تم تصدير البيانات بنجاح!' });
    } catch (error) {
      console.error("Export Error:", error);
      setStatus({ type: 'error', message: t('errorExport') || 'حدث خطأ أثناء تصدير البيانات.' });
    }
  };

  // ✅ 2. دالة الاستيراد
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (!data.vehicles && !data.currentCar) {
          throw new Error("Invalid File");
        }

        if (window.confirm(t('confirmImport') || 'تحذير: سيتم استبدال جميع بياناتك الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
          
          if (data.currentCar) localStorage.setItem('savedCar', JSON.stringify(data.currentCar));
          if (data.vehicles) localStorage.setItem('vehicles', JSON.stringify(data.vehicles));
          
          if (data.fuel) localStorage.setItem('fuel_records', JSON.stringify(data.fuel));
          if (data.maintenance) localStorage.setItem('maintenance_records', JSON.stringify(data.maintenance));
          if (data.expenses) localStorage.setItem('expenses_records', JSON.stringify(data.expenses));
          if (data.incomes) localStorage.setItem('income_records', JSON.stringify(data.incomes)); 
          if (data.documents) localStorage.setItem('documents_records', JSON.stringify(data.documents));
          if (data.reminders) localStorage.setItem('reminders_records', JSON.stringify(data.reminders));
          if (data.customTypes) localStorage.setItem('custom_maintenance_types', JSON.stringify(data.customTypes)); 

          if (data.settings) {
            if (data.settings.theme) localStorage.setItem('theme', data.settings.theme);
            if (data.settings.lang) localStorage.setItem('lang', data.settings.lang);
            if (data.settings.currency) localStorage.setItem('currency', data.settings.currency);
            if (data.settings.user_name) localStorage.setItem('user_name', data.settings.user_name);
          }

          alert(t('importSuccess') || 'تم استيراد البيانات بنجاح! سيتم إعادة تشغيل التطبيق.');
          window.location.reload(); 
        }
      } catch (error) {
        console.error("Import Error:", error);
        setStatus({ type: 'error', message: t('importError') || 'خطأ: الملف غير صالح أو تالف.' });
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  return (
    <div className="space-y-4 pb-24 px-4 max-w-2xl mx-auto min-h-screen">
      
      {/* الشريط العلوي الثابت */}
      <div className="sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('backup') || 'النسخ الاحتياطي'}</h1>
      </div>

      {/* بطاقة الأمان (تصميم احترافي) */}
      <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-5 rounded-3xl flex flex-col items-center text-center space-y-3">
        <div className="p-3 bg-green-500/20 rounded-full">
          <ShieldCheck size={32} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">{t('dataProtection') || 'حماية البيانات'}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs leading-relaxed">
            {t('backupDesc') || 'بياناتك محفوظة محلياً على هاتفك. احتفظ بنسخة احتياطية لضمان عدم فقدانها عند تغيير الجهاز.'}
          </p>
        </div>
      </div>

      {/* حالة آخر نسخة احتياطية */}
      {lastBackup && (
        <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-[var(--text)]">
            <Database size={16} className="text-[var(--primary)]" />
            <span>{t('lastBackup') || 'آخر نسخة احتياطية:'}</span>
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)]">{lastBackup}</span>
        </div>
      )}

      {/* رسائل الحالة */}
      {status.message && (
        <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-fade-in ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {status.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {status.message}
        </div>
      )}

      {/* الأزرار بتصميم احترافي (List Style) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mt-4">
        
        {/* زر التصدير */}
        <button 
          onClick={exportData} 
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)] active:bg-[var(--surface-3)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Download size={18} />
            </div>
            <div className="text-start">
              <p className="text-sm font-bold text-[var(--text)]">{t('exportDataBtn') || 'تصدير البيانات'}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('exportDesc') || 'حفظ نسخة على هاتفك (JSON)'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
        </button>

        {/* زر الاستيراد */}
        <input type="file" accept=".json,application/json" ref={fileInputRef} onChange={handleImport} className="hidden" />
        <button 
          onClick={() => fileInputRef.current.click()} 
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors active:bg-[var(--surface-3)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <Upload size={18} />
            </div>
            <div className="text-start">
              <p className="text-sm font-bold text-[var(--text)]">{t('importDataBtn') || 'استيراد البيانات'}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('importDesc') || 'استعادة نسخة سابقة من ملف'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
        </button>
      </div>

      {/* تحذير الاستيراد */}
      <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10 mt-2">
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-red-500/80 leading-relaxed">
          {t('importWarning') || 'تنبيه: عملية الاستيراد ستقوم بمسح جميع البيانات الحالية واستبدالها بالبيانات الموجودة في الملف. يرجى التأكد قبل المتابعة.'}
        </p>
      </div>

    </div>
  );
}
