import { useContext, useRef, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { useNavigate } from 'react-router-dom'; 
import { 
  FileSpreadsheet, FileText, X, CheckCircle, AlertTriangle, ChevronRight, Settings as SettingsIcon
} from 'lucide-react'; 

import { safeNumber } from '../shared/utils/safeNumber.js';

/* ✅ حماية CSV من الحقن (CSV Injection) */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // منع تنفيذ الصيغ في Excel/Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  // هروب علامات الاقتباس
  return `"${str.replace(/"/g, '""')}"`;
};

export default function Backup() {
  const { t, currentCar, currency } = useContext(AppContext);
  const navigate = useNavigate(); 
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const toastTimeoutRef = useRef(null);

  /* ✅ Toast آمن مع cleanup */
  const showToast = useCallback((type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  }, []);

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  /* ✅ جلب الكمية والوحدة بأمان */
  const getFuelInfo = (f) => {
    const amount = safeNumber(f.amount ?? f.liters);
    const unit = f.energyType === 'electricity' ? 'kWh' : 'L';
    return `${amount} ${unit}`;
  };

  /* ✅ تصدير CSV (محمي + محصّن + غير متزامن) */
  const exportCSV = async () => {
    if (!currentCar) return;
    
    try {
      const carIdStr = String(currentCar.id);
      
      // جلب البيانات من IndexedDB
      const allFuel = await dbService.getFuel() || [];
      const allMaint = await dbService.getMaintenance() || [];
      const allExp = await dbService.getExpenses() || [];
      const allInc = await dbService.getIncomes() || [];

      const fuel = allFuel
        .filter(f => String(f.carId) === carIdStr)
        .map(f => ({ 
          date: f.date, 
          type: f.energyType === 'electricity' ? (t('chargingSession') || 'شحن') : (t('fuel') || 'وقود'),
          amount: safeNumber(f.cost), 
          odometer: safeNumber(f.odometer), 
          notes: getFuelInfo(f)
        }));
        
      const maint = allMaint
        .filter(m => String(m.carId) === carIdStr)
        .map(m => ({ 
          date: m.date, 
          type: t(m.type) || m.type || 'صيانة', 
          amount: safeNumber(m.cost), 
          odometer: safeNumber(m.nextKm), 
          notes: '' 
        }));
        
      const exp = allExp
        .filter(e => String(e.carId) === carIdStr)
        .map(e => ({ 
          date: e.date, 
          type: t(e.type) || e.type || 'مصروف', 
          amount: safeNumber(e.cost), 
          odometer: 0, 
          notes: '' 
        }));
        
      const inc = allInc
        .filter(i => String(i.carId) === carIdStr)
        .map(i => ({ 
          date: i.date, 
          type: t(i.type) || i.type || 'إيراد', 
          amount: safeNumber(i.amount), 
          odometer: 0, 
          notes: i.notes || '' 
        }));

      const allData = [...fuel, ...maint, ...exp, ...inc].sort((a, b) => 
        String(b.date || '').localeCompare(String(a.date || ''))
      );

      // ✅ إضافة تحسين: منع تصدير ملف فارغ
      if (allData.length === 0) {
        return showToast('error', t('noData') || 'لا توجد بيانات لتصديرها.');
      }

      const headers = [
        t('date') || 'التاريخ', 
        t('type') || 'النوع', 
        t('amount') || 'المبلغ', 
        t('currency') || 'العملة', 
        t('odometer') || 'العداد', 
        t('notes') || 'ملاحظات'
      ];
      const csvRows = [headers.map(escapeCSV).join(',')];

      allData.forEach(row => {
        const values = [
          escapeCSV(row.date),
          escapeCSV(row.type), 
          escapeCSV(row.amount),
          escapeCSV(currency),
          escapeCSV(row.odometer > 0 ? row.odometer : ''),
          escapeCSV(row.notes)
        ];
        csvRows.push(values.join(','));
      });

      const csvString = "\uFEFF" + csvRows.join('\r\n'); 
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timeStamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
      a.href = url;
      a.download = `RafiqSayarati-Data-${timeStamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast('success', t('excelSuccess') || 'تم التصدير بنجاح');
    } catch (error) {
      console.error("CSV Error:", error);
      showToast('error', t('errorExport') || 'فشل التصدير');
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 max-w-2xl mx-auto min-h-screen relative">
      
      {/* Toast */}
      {toast.show && (
        <div 
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {toast.type === 'success' 
            ? <CheckCircle size={18} aria-hidden="true" /> 
            : <AlertTriangle size={18} aria-hidden="true" />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast({ show: false, type: '', message: '' })} 
            aria-label={t('close') || 'إغلاق'}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* الشريط العلوي */}
      <div className="sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10 mb-4">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('exportCenter') || 'مركز التصدير'}</h1>
      </div>

      {/* مركز التصدير */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        
        {/* تصدير PDF */}
        <button 
          type="button"
          onClick={() => navigate('/report-print')} 
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <FileText size={18} aria-hidden="true" />
            </div>
            <div className="text-start">
              <p className="text-sm font-bold text-[var(--text)]">{t('pdfReport') || 'تقرير PDF'}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('pdfReportDesc') || 'تصدير البيانات كتقرير للطباعة'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" aria-hidden="true" />
        </button>

        {/* تصدير Excel/CSV */}
        <button 
          type="button"
          onClick={exportCSV} 
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
              <FileSpreadsheet size={18} aria-hidden="true" />
            </div>
            <div className="text-start">
              <p className="text-sm font-bold text-[var(--text)]">{t('excelExport') || 'جدول بيانات (Excel)'}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('excelExportDesc') || 'تصدير كامل السجلات بصيغة CSV'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>

      {/* التوجيه للنسخ الاحتياطي */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
        <SettingsIcon className="text-blue-500 flex-shrink-0" size={20} aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-[var(--text)] mb-1">
            {t('systemBackup') || 'النسخة الاحتياطية للنظام'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {t('backupMovedMsg') || 'تم نقل ميزة حفظ واستعادة البيانات (JSON) إلى صفحة الإعدادات لتوحيد التجربة.'}
          </p>
          <button 
            type="button"
            onClick={() => navigate('/settings')} 
            className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform"
          >
            {t('goToSettings') || 'الذهاب إلى الإعدادات'}
          </button>
        </div>
      </div>

    </div>
  );
}
