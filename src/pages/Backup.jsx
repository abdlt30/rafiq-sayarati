import { useContext, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom'; 
import { 
  FileSpreadsheet, FileText, Printer, X, CheckCircle, AlertTriangle, ChevronRight, Settings as SettingsIcon
} from 'lucide-react'; 

export default function ExportCenter() {
  const { t, lang, currentCar, currency, dataVersion } = useContext(AppContext);
  const navigate = useNavigate(); 
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  // ✅ دالة مساعدة آمنة لجلب الكمية والوحدة (تدعم البنزين والكهرباء)
  const getFuelInfo = (f) => {
    if (f.energyType === 'electricity') return `${f.amount || f.liters || 0} kWh`;
    return `${f.amount || f.liters || 0} L`;
  };

  // ✅ 1. تصدير Excel/CSV (مُصلح)
  const exportCSV = () => {
    if (!currentCar) return;
    
    try {
      const carIdStr = String(currentCar.id);
      
      const fuel = dbService.getFuel()
        .filter(f => String(f.carId) === carIdStr)
        .map(f => ({ 
          date: f.date, 
          type: t('fuel') || 'الوقود', 
          amount: f.cost, 
          odometer: f.odometer, 
          notes: getFuelInfo(f) // ✅ إصلاح الوحدة
        }));
        
      const maint = dbService.getMaintenance()
        .filter(m => String(m.carId) === carIdStr)
        .map(m => ({ 
          date: m.date, 
          type: t(m.type) || m.type, 
          amount: m.cost, 
          odometer: m.nextKm || '', 
          notes: '' 
        }));
        
      const exp = dbService.getExpenses()
        .filter(e => String(e.carId) === carIdStr)
        .map(e => ({ 
          date: e.date, 
          type: t(e.type) || e.type, 
          amount: e.cost, 
          odometer: '', 
          notes: '' 
        }));
        
      const inc = dbService.getIncomes()
        .filter(i => String(i.carId) === carIdStr)
        .map(i => ({ 
          date: i.date, 
          type: t(i.type) || i.type, 
          amount: i.amount, 
          odometer: '', 
          notes: i.notes || '' 
        }));

      const allData = [...fuel, ...maint, ...exp, ...inc].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

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

  return (
    <div className="space-y-4 pb-24 px-4 max-w-2xl mx-auto min-h-screen relative">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button onClick={() => setToast({ show: false, type: '', message: '' })} className="ml-2 opacity-70 hover:opacity-100">
            <X size={16} />
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
        <button onClick={() => navigate('/report-print')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)]">
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
        <button onClick={exportCSV} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><FileSpreadsheet size={18} /></div>
            <div className="text-start">
              <p className="text-sm font-bold text-[var(--text)]">{t('excelExport') || 'جدول بيانات (Excel)'}</p>
              <p className="text-[10px] text-[var(--text-muted)]">ملف CSV يفتح في الإكسيل وجوجل شيت</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--text-muted)] rtl:rotate-180" />
        </button>
      </div>

      {/* التوجيه للنسخ الاحتياطي */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
        <SettingsIcon className="text-blue-500 flex-shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold text-[var(--text)] mb-1">
            {t('systemBackup') || 'النسخ الاحتياطي للبيانات'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {t('backupMovedMsg') || 'تم نقل ميزة حفظ واستعادة البيانات (JSON) إلى صفحة الإعدادات لتوحيد التجربة.'}
          </p>
          <button 
            onClick={() => navigate('/settings')} 
            className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            {t('goToSettings') || 'الذهاب إلى الإعدادات'}
          </button>
        </div>
      </div>

    </div>
  );
}
