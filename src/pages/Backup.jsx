import { useContext, useRef, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom'; 
import { 
  FileSpreadsheet, FileText, X, CheckCircle, AlertTriangle, ChevronRight, Settings as SettingsIcon
} from 'lucide-react'; 

// ✅ 1. استيراد الدالة المشتركة
import { safeNumber } from '../shared/utils/safeNumber';

/* ✅ 2. حماية CSV من الحقن (CSV Injection) */
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

  /* ✅ 3. تصدير CSV (محمي + محصّن) */
  const exportCSV = () => {
    if (!currentCar) return;
    
    try {
      const carIdStr = String(currentCar.id);
      
      const fuel = (dbService.getFuel() || [])
        .filter(f => String(f.carId) === carIdStr)
        .map(f => ({ 
          date: f.date, 
          type: f.energyType === 'electricity' ? t('chargingSession') : t('fuel'),
          amount: safeNumber(f.cost), 
          odometer: safeNumber(f.odometer), 
          notes: getFuelInfo(f)
        }));
        
      const maint = (dbService.getMaintenance() || [])
        .filter(m => String(m.carId) === carIdStr)
        .map(m => ({ 
          date: m.date, 
          type: t(m.type) || m.type, 
          amount: safeNumber(m.cost), 
          odometer: safeNumber(m.nextKm), 
          notes: '' 
        }));
        
      const exp = (dbService.getExpenses() || [])
        .filter(e => String(e.carId) === carIdStr)
        .map(e => ({ 
          date: e.date, 
          type: t(e.type) || e.type, 
          amount: safeNumber(e.cost), 
          odometer: 0, 
          notes: '' 
        }));
        
      const inc = (dbService.getIncomes() || [])
        .filter(i => String(i.carId) === carIdStr)
        .map(i => ({ 
          date: i.date, 
          type: t(i.type) || i.type, 
          amount: safeNumber(i.amount), 
          odometer: 0, 
          notes: i.notes || '' 
        }));

      const allData = [...fuel, ...maint, ...exp, ...inc].sort((a, b) => 
        String(b.date || '').localeCompare(String(a.date || ''))
      );

      const headers = [
        t('date'), 
        t('type'), 
        t('amount'), 
        t('currency'), 
        t('odometer'), 
        t('notes')
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
      // ✅ تأجيل revoke لضمان اكتمال التنزيل
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast('success', t('excelSuccess'));
    } catch (error) {
      console.error("CSV Error:", error);
      showToast('error', t('errorExport'));
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 max-w-2xl mx-auto min-h-screen relative">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' 
            ? <CheckCircle size={18} aria-hidden="true" /> 
            : <AlertTriangle size={18} aria-hidden="true" />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast({ show: false, type: '', message: '' })} 
            aria-label={t('close')}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* الشريط العلوي */}
      <div className="sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10 mb-4">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('exportCenter')}</h1>
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
              <p className="text-sm font-bold text-[var(--text)]">{t('pdfReport')}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('pdfReportDesc')}</p>
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
              <p className="text-sm font-bold text-[var(--text)]">{t('excelExport')}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('excelExportDesc')}</p>
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
            {t('systemBackup')}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {t('backupMovedMsg')}
          </p>
          <button 
            type="button"
            onClick={() => navigate('/settings')} 
            className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform"
          >
            {t('goToSettings')}
          </button>
        </div>
      </div>

    </div>
  );
}
