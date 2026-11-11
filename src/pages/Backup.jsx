import { useContext, useRef, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom'; 
import { 
  Download, Upload, ShieldCheck, AlertTriangle, CheckCircle, 
  Database, ChevronRight, FileSpreadsheet, FileText, Printer, X 
} from 'lucide-react'; 

export default function Backup() {
  const { t, lang, currentCar, currency } = useContext(AppContext);
  const navigate = useNavigate(); 
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [lastBackup, setLastBackup] = useState('');

  // دالة مساعدة لإظهار الإشعار العائم
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000); // يختفي بعد 3 ثواني
  };

  useEffect(() => {
    const savedDate = localStorage.getItem('last_backup_date');
    if (savedDate) {
      const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
      setLastBackup(new Date(savedDate).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    }
  }, [lang]);

  // ✅ 1. تصدير JSON (نسخة احتياطية)
  const exportJSON = () => {
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
      // ✅ إضافة الوقت للاسم لمنع تكرار رسالة المتصفح
      const timeStamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
      a.href = url;
      a.download = `RafiqSayarati-Backup-${timeStamp}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      localStorage.setItem('last_backup_date', now);
      const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';
      setLastBackup(new Date(now).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));

      showToast('success', t('exportSuccess') || 'تم تصدير النسخة الاحتياطية بنجاح!');
    } catch (error) {
      console.error("Export Error:", error);
      showToast('error', t('errorExport') || 'حدث خطأ أثناء تصدير البيانات.');
    }
  };

  // ✅ 2. تصدير Excel/CSV
  const exportCSV = () => {
    if (!currentCar) return;
    
    try {
      const fuel = dbService.getFuel().filter(f => f.carId === currentCar.id).map(f => ({ date: f.date, type: t('fuel') || 'الوقود', amount: f.cost, odometer: f.odometer, notes: `${f.liters}L` }));
      const maint = dbService.getMaintenance().filter(m => m.carId === currentCar.id).map(m => ({ date: m.date, type: t(m.type) || m.type, amount: m.cost, odometer: m.nextKm || '', notes: '' }));
      const exp = dbService.getExpenses().filter(e => e.carId === currentCar.id).map(e => ({ date: e.date, type: t(e.type) || e.type, amount: e.cost, odometer: '', notes: '' }));
      const inc = dbService.getIncomes().filter(i => i.carId === currentCar.id).map(i => ({ date: i.date, type: t(i.type) || i.type, amount: i.amount, odometer: '', notes: i.notes || '' }));

      const allData = [...fuel, ...maint, ...exp, ...inc].sort((a, b) => new Date(b.date) - new Date(a.date));

      const headers = [
        `"${t('date') || 'التاريخ'}"`, 
        `"${t('type') || 'النوع'}"`, 
        `"${t('amount') || 'المبلغ'}"`, 
        `"${t('currency') || 'العملة'}"`, 
        `"${t('odometer') || 'العداد'}"`, 
        `"${t('notes') || 'ملاحظات'}"`
      ];
      const csvRows = [headers.join(',')];

      allData.forEach(row => {
        const values = [
          `"${row.date}"`,
          `"${row.type}"`, 
          row.amount,
          `"${currency}"`,
          row.odometer ? `"${row.odometer}"` : '""',
          `"${row.notes}"`
        ];
        csvRows.push(values.join(','));
      });

      const csvString = "\uFEFF" + csvRows.join('\r\n'); 
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      // ✅ إضافة الوقت للاسم
      const timeStamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
      a.href = url;
      a.download = `RafiqSayarati-Data-${timeStamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      showToast('success', t('excelSuccess') || 'تم تصدير جدول البيانات بنجاح!');
    } catch (error) {
      console.error("CSV Error:", error);
      showToast('error', 'حدث خطأ أثناء تصدير الجدول.');
    }
  };

  // ✅ 3. دالة الاستيراد
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
        showToast('error', t('importError') || 'خطأ: الملف غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  return (
    <div className="space-y-4 pb-24 px-4 max-w-2xl mx-auto min-h-screen relative">
      
      {/* ✅ الإشعار العائم (Toast) */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button onClick={() => setToast({ show: false, type: '', message: '' })} className="ml-2 opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* الشريط العلوي */}
      <div className="sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10 mb-4">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('backupAndExport') || 'النسخ الاحتياطي والتصدير'}</h1>
      </div>

      {/* مركز التصدير */}
      <div>
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">{t('exportCenter') || 'مركز التصدير'}</h2>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          {/* تصدير PDF */}
          <button onClick={() => navigate('/report-print')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)] active:bg-[var(--surface-3)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FileText size={18} /></div>
              <div className="text-start">
                <p className="text-sm font-bold text-[var(--text)]">{t('pdfReport') || 'تقرير مالي (PDF)'}</p>
                <p className="text-[10px] text-[var(--text-muted)]">تقرير أنيق جاهز للطباعة أو المشاركة</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
          </button>

          {/* تصدير Excel/CSV */}
          <button onClick={exportCSV} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)] active:bg-[var(--surface-3)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><FileSpreadsheet size={18} /></div>
              <div className="text-start">
                <p className="text-sm font-bold text-[var(--text)]">{t('excelExport') || 'جدول بيانات (Excel)'}</p>
                <p className="text-[10px] text-[var(--text-muted)]">ملف CSV يفتح في الإكسيل وجوجل شيت</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
          </button>

          {/* طباعة */}
          <button onClick={() => navigate('/print-data')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors active:bg-[var(--surface-3)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Printer size={18} /></div>
              <div className="text-start">
                <p className="text-sm font-bold text-[var(--text)]">{t('printData') || 'طباعة مباشرة'}</p>
                <p className="text-[10px] text-[var(--text-muted)]">طباعة القائمة الحالية عبر الطابعة</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* النسخ الاحتياطي للنظام */}
      <div className="mt-6">
        <h2 className="text-xs font-bold text-[var(--text-muted)] mb-3 px-1 uppercase tracking-wider">{t('systemBackup') || 'النسخة الاحتياطية للنظام'}</h2>

        {lastBackup && (
          <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl mb-2">
            <div className="flex items-center gap-2 text-sm text-[var(--text)]">
              <Database size={16} className="text-[var(--primary)]" />
              <span>{t('lastBackup') || 'آخر نسخة احتياطية:'}</span>
            </div>
            <span className="text-xs font-bold text-[var(--text-muted)]">{lastBackup}</span>
          </div>
        )}

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          {/* تصدير JSON */}
          <button onClick={exportJSON} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)] active:bg-[var(--surface-3)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Download size={18} /></div>
              <div className="text-start">
                <p className="text-sm font-bold text-[var(--text)]">{t('exportDataBtn') || 'تصدير البيانات (JSON)'}</p>
                <p className="text-[10px] text-[var(--text-muted)]">حفظ نسخة على هاتفك لنقل التطبيق</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
          </button>

          {/* استيراد JSON */}
          <input type="file" accept=".json,application/json" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors active:bg-[var(--surface-3)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><Upload size={18} /></div>
              <div className="text-start">
                <p className="text-sm font-bold text-[var(--text)]">{t('importDataBtn') || 'استيراد البيانات'}</p>
                <p className="text-[10px] text-[var(--text-muted)]">استعادة نسخة سابقة (ملف JSON)</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
          </button>
        </div>
      </div>

    </div>
  );
}
