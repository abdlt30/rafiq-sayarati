import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext.jsx'; 
import { dbService } from '../services/dbService.js'; 
import { Link } from 'react-router-dom';
import { ArrowRight, Printer, FileText, Loader2 } from 'lucide-react';

import { safeNumber } from '../shared/utils/safeNumber.js'; 
import { formatDate as formatDateShared } from '../shared/utils/formatters.js'; 

/* ✅ كمية الوقود: يدعم amount الجديد + liters القديم */
const getFuelAmount = (r) => {
  if (r.amount !== undefined && r.amount !== null && r.amount !== '') return safeNumber(r.amount);
  return safeNumber(r.liters);
};

/* ✅ وحدة الوقود */
const getFuelUnit = (r) => (r.energyType === 'electricity' ? 'kWh' : 'L');

/* ✅ النسبة المئوية الآمنة (ترفض السالب والقيم غير المنطقية) */
const percent = (part, total) => {
  if (!Number.isFinite(part) || !Number.isFinite(total) || part < 0 || total <= 0) return '—';
  const p = (part / total) * 100;
  if (!Number.isFinite(p) || p < 0 || p > 100) return '—';
  return `${p.toFixed(1)}%`;
};

export default function ReportPrint() {
  const { currentCar, t, currency, lang, dataVersion } = useContext(AppContext);
  const [period, setPeriod] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(''); // ✅ حالة لالتقاط أخطاء الجلب
  
  const [data, setData] = useState({ fuel: [], maintenance: [], expenses: [], incomes: [] });

  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const carMake = (currentCar?.make || '').trim();
  const carModel = (currentCar?.model || '').trim();
  const carTitle = `${carMake} ${carModel}`.trim() || '—';

  const carYearNum = Number(currentCar?.year);
  const carYearDisplay = Number.isFinite(carYearNum) && carYearNum > 0 ? carYearNum : null;

  const carOdometerNum = safeNumber(currentCar?.odometer);
  const carPlate = (currentCar?.plate || '').trim();

  const formatDate = (dateString) => formatDateShared(dateString, todayLocale);

  /* ===================== جمع البيانات (غير متزامن) ===================== */
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!currentCar) {
        if (isMounted) setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setErrorMsg('');
      try {
        const allFuel = await dbService.getFuel() || [];
        const allMaint = await dbService.getMaintenance() || [];
        const allExp = await dbService.getExpenses() || [];
        const allInc = await dbService.getIncomes() || [];

        const normalizeDate = (s) => {
          if (!s) return null;
          const str = String(s).includes('T') ? s : `${s}T00:00:00`;
          const d = new Date(str);
          if (isNaN(d.getTime())) return null;
          d.setHours(0, 0, 0, 0);
          return d;
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isInPeriod = (dateString) => {
          if (period === 'all') return true;
          const d = normalizeDate(dateString);
          if (!d) return false;
          if (period === 'month') {
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
          }
          if (period === 'year') {
            return d.getFullYear() === today.getFullYear();
          }
          return true;
        };

        const carIdStr = String(currentCar.id);
        const filterByCar = (arr) =>
          (Array.isArray(arr) ? arr : []).filter(
            r => r && String(r.carId) === carIdStr && isInPeriod(r.date)
          );

        const sortByDateDesc = (arr) =>
          [...arr].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

        if (isMounted) {
          setData({
            fuel: sortByDateDesc(filterByCar(allFuel)),
            maintenance: sortByDateDesc(filterByCar(allMaint)),
            expenses: sortByDateDesc(filterByCar(allExp)),
            incomes: sortByDateDesc(filterByCar(allInc)),
          });
        }
      } catch (e) {
        console.error('Report data load failed:', e);
        if (isMounted) setErrorMsg(t('errorSaving') || 'حدث خطأ أثناء تحميل البيانات.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentCar, period, dataVersion, t]);

  /* ===================== الإجماليات ===================== */
  const totals = useMemo(() => {
    const sum = (arr, key) => arr.reduce((s, r) => {
      const val = safeNumber(r?.[key]);
      return s + (val > 0 ? val : 0);
    }, 0);
    
    const fuel = sum(data.fuel, 'cost');
    const maintenance = sum(data.maintenance, 'cost');
    const expenses = sum(data.expenses, 'cost');
    const income = sum(data.incomes, 'amount');
    const totalExpenses = fuel + maintenance + expenses;
    const net = income - totalExpenses;
    return {
      fuel,
      maintenance,
      expenses,
      income,
      totalExpenses,
      net: Number.isFinite(net) ? net : 0,
    };
  }, [data]);

  const getMaintenanceTypeLabel = (type) => {
    if (!type) return '—';
    return t(type) || type;
  };

  if (!currentCar) return null;

  const todayStr = new Date().toLocaleDateString(todayLocale, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const hasAnyData = data.fuel.length > 0 || data.maintenance.length > 0 || data.expenses.length > 0 || data.incomes.length > 0;

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error('Print failed:', e);
    }
  };

  // ✅ شاشة تحميل أثناء جلب البيانات
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-[var(--primary)]" aria-live="polite">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-bold text-[var(--text-muted)]">{t('loading') || 'جاري التحميل...'}</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col justify-center items-center h-64 p-6 text-center">
        <p className="text-red-500 font-bold mb-4">{errorMsg}</p>
        <button onClick={() => setPeriod('all')} className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg">{t('retry') || 'إعادة المحاولة'}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      
      {/* شريط التحكم (مخفي عند الطباعة) */}
      <div className="no-print sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link
            to="/reports"
            aria-label={t('back') || 'رجوع'}
            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl active:scale-90 transition-transform"
          >
            <ArrowRight size={20} className={`text-[var(--text)] ${dir === 'ltr' ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Link>
          <h1 className="text-lg font-bold text-[var(--text)]">
            {t('financialReport') || 'تقرير مالي'}
          </h1>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            <Printer size={16} aria-hidden="true" /> {t('printPdf') || 'طباعة PDF'}
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { v: 'all', l: t('allPeriods') || 'كل الفترات' },
            { v: 'month', l: t('thisMonth') || 'هذا الشهر' },
            { v: 'year', l: t('thisYear') || 'هذه السنة' },
          ].map(p => (
            <button
              key={p.v}
              type="button"
              onClick={() => setPeriod(p.v)}
              aria-pressed={period === p.v}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                period === p.v
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ التقرير القابل للطباعة (إضافة print-color-adjust لضمان ظهور الألوان في PDF) */}
      <div className="print-container bg-white text-black p-6 sm:p-10 mx-auto max-w-4xl my-4 shadow-2xl rounded-2xl" style={{ direction: dir, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        
        {/* الترويسة */}
        <div className="flex justify-between items-center border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">🚗</div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">
                {t('appName') || 'رفيق سيارتي'}
              </h1>
              <p className="text-sm font-bold text-blue-600">
                {t('comprehensiveFinancialReport') || 'تقرير مالي شامل'}
              </p>
            </div>
          </div>
          <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {t('issueDate') || 'تاريخ الإصدار'}
            </p>
            <p className="text-sm font-black text-gray-900">{todayStr}</p>
          </div>
        </div>

        {/* معلومات السيارة */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">{t('car') || 'السيارة'}</p>
            <p className="text-2xl font-black text-gray-900">
              {carTitle}
              {carYearDisplay && <span className="text-gray-400 text-lg"> ({carYearDisplay})</span>}
            </p>
          </div>
          <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
            {carPlate && (
              <p className="text-sm text-gray-700 mb-1">
                {t('plate') || 'اللوحة'}:{' '}
                <span className="font-mono font-bold bg-white px-2 py-1 border border-gray-300 rounded">{carPlate}</span>
              </p>
            )}
            {carOdometerNum > 0 && (
              <p className="text-sm text-gray-700">
                {t('odometer') || 'العداد'}: <span className="font-bold">{carOdometerNum.toLocaleString()} {t('km') || 'كم'}</span>
              </p>
            )}
          </div>
        </div>

        {/* حالة فارغة */}
        {!hasAnyData && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 mb-8 text-center">
            <FileText className="mx-auto mb-3 text-gray-400" size={48} aria-hidden="true" />
            <p className="text-sm text-gray-500 font-bold">
              {t('noData') || 'لا توجد بيانات كافية'}
            </p>
          </div>
        )}

        {hasAnyData && (
          <>
            {/* الملخص المالي */}
            <div className="mb-8 page-break">
              <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-blue-600`}>
                {t('financialSummary') || 'الملخص المالي'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-green-700 font-bold mb-1">{t('totalIncome') || 'إجمالي الإيرادات'}</p>
                  <p className="text-2xl font-black text-green-600" dir="ltr">+ {totals.income.toLocaleString()} {currency}</p>
                </div>
                <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <p className="text-xs text-red-700 font-bold mb-1">{t('totalExpenses') || 'إجمالي المصاريف'}</p>
                  <p className="text-2xl font-black text-red-600" dir="ltr">- {totals.totalExpenses.toLocaleString()} {currency}</p>
                </div>
                
                <div className="col-span-2 border-2 border-gray-900 rounded-xl p-5 bg-gray-900 text-white flex flex-col justify-center gap-3 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <p className="text-sm text-gray-300 font-bold">{t('netProfit') || 'صافي الربح'}</p>
                    <div className="text-4xl opacity-30" aria-hidden="true">💰</div>
                  </div>
                  <p className={`text-4xl font-black relative z-10 ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`} dir="ltr">
                    {totals.net >= 0 ? '+' : ''}{totals.net.toLocaleString()} {currency}
                  </p>
                </div>
              </div>
            </div>

            {/* تفصيل المصاريف */}
            {totals.totalExpenses > 0 && (
              <div className="mb-8 page-break">
                <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-blue-600`}>
                  {t('expenseDistribution') || 'توزيع المصاريف'}
                </h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th scope="col" className="p-3 text-start font-bold text-gray-700">{t('category') || 'الفئة'}</th>
                      <th scope="col" className="p-3 text-start font-bold text-gray-700">{t('amount') || 'المبلغ'}</th>
                      <th scope="col" className="p-3 text-start font-bold text-gray-700">{t('percentage') || 'النسبة'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-3">{t('fuel') || 'وقود'}</td>
                      <td className="p-3 font-bold" dir="ltr">{totals.fuel.toLocaleString()} {currency}</td>
                      <td className="p-3 font-bold">{percent(totals.fuel, totals.totalExpenses)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-3">{t('maintenance') || 'صيانة'}</td>
                      <td className="p-3 font-bold" dir="ltr">{totals.maintenance.toLocaleString()} {currency}</td>
                      <td className="p-3 font-bold">{percent(totals.maintenance, totals.totalExpenses)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-3">{t('otherExpenses') || 'مصاريف أخرى'}</td>
                      <td className="p-3 font-bold" dir="ltr">{totals.expenses.toLocaleString()} {currency}</td>
                      <td className="p-3 font-bold">{percent(totals.expenses, totals.totalExpenses)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td className="p-3 font-black">{t('total') || 'الإجمالي'}</td>
                      <td className="p-3 font-black text-red-600" dir="ltr">{totals.totalExpenses.toLocaleString()} {currency}</td>
                      <td className="p-3 font-black">{percent(totals.totalExpenses, totals.totalExpenses)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* سجل الوقود */}
            {data.fuel.length > 0 && (
              <div className="mb-8 page-break">
                <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-blue-600`}>
                  {t('fuelLog') || 'سجل الوقود'} ({data.fuel.length})
                </h2>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th scope="col" className="p-2 text-start">{t('date') || 'التاريخ'}</th>
                      <th scope="col" className="p-2 text-start">{t('odometer') || 'العداد'}</th>
                      <th scope="col" className="p-2 text-start">{t('amount') || 'المبلغ'}</th>
                      <th scope="col" className="p-2 text-start">{t('cost') || 'التكلفة'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fuel.map(f => {
                      const amount = getFuelAmount(f);
                      const unit = getFuelUnit(f);
                      const odo = safeNumber(f.odometer);
                      const cost = safeNumber(f.cost);
                      return (
                        <tr key={f.id} className="border-b border-gray-200">
                          <td className="p-2">{formatDate(f.date)}</td>
                          <td className="p-2">{odo > 0 ? odo.toLocaleString() : '—'}</td>
                          <td className="p-2">{amount > 0 ? `${amount} ${unit}` : '—'}</td>
                          <td className="p-2 font-bold" dir="ltr">{cost.toLocaleString()} {currency}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* سجل الصيانة */}
            {data.maintenance.length > 0 && (
              <div className="mb-8 page-break">
                <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-blue-600`}>
                  {t('maintenanceLog') || 'سجل الصيانة'} ({data.maintenance.length})
                </h2>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th scope="col" className="p-2 text-start">{t('date') || 'التاريخ'}</th>
                      <th scope="col" className="p-2 text-start">{t('maintenanceType') || 'نوع الصيانة'}</th>
                      <th scope="col" className="p-2 text-start">{t('cost') || 'التكلفة'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.maintenance.map(m => {
                      const cost = safeNumber(m.cost);
                      return (
                        <tr key={m.id} className="border-b border-gray-200">
                          <td className="p-2">{formatDate(m.date)}</td>
                          <td className="p-2">{getMaintenanceTypeLabel(m.type)}</td>
                          <td className="p-2 font-bold" dir="ltr">{cost.toLocaleString()} {currency}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* سجل المصاريف الأخرى */}
            {data.expenses.length > 0 && (
              <div className="mb-8 page-break">
                <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-blue-600`}>
                  {t('otherExpensesLog') || 'سجل المصاريف الأخرى'} ({data.expenses.length})
                </h2>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th scope="col" className="p-2 text-start">{t('date') || 'التاريخ'}</th>
                      <th scope="col" className="p-2 text-start">{t('expenseType') || 'نوع المصروف'}</th>
                      <th scope="col" className="p-2 text-start">{t('cost') || 'التكلفة'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenses.map(e => {
                      const cost = safeNumber(e.cost);
                      return (
                        <tr key={e.id} className="border-b border-gray-200">
                          <td className="p-2">{formatDate(e.date)}</td>
                          <td className="p-2">{t(e.type) || e.type}</td>
                          <td className="p-2 font-bold" dir="ltr">{cost.toLocaleString()} {currency}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* سجل الإيرادات */}
            {data.incomes.length > 0 && (
              <div className="mb-8 page-break">
                <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-green-600`}>
                  {t('incomeLog') || 'سجل الإيرادات'} ({data.incomes.length})
                </h2>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th scope="col" className="p-2 text-start">{t('date') || 'التاريخ'}</th>
                      <th scope="col" className="p-2 text-start">{t('incomeType') || 'نوع الإيراد'}</th>
                      <th scope="col" className="p-2 text-start">{t('notes') || 'ملاحظات'}</th>
                      <th scope="col" className="p-2 text-start">{t('amount') || 'المبلغ'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.incomes.map(i => {
                      const amount = safeNumber(i.amount);
                      return (
                        <tr key={i.id} className="border-b border-gray-200">
                          <td className="p-2">{formatDate(i.date)}</td>
                          <td className="p-2">{t(i.type) || i.type}</td>
                          <td className="p-2">{i.notes || '—'}</td>
                          <td className="p-2 font-bold text-green-600" dir="ltr">+ {amount.toLocaleString()} {currency}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* التذييل */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
          <p className="font-bold mb-1">
            {t('reportFooter1') || 'تم إنشاء هذا التقرير بواسطة تطبيق رفيق سيارتي'}
          </p>
          <p>
            {t('reportFooter2') || 'هذا التقرير تم توليده آلياً بناءً على البيانات التي قام المستخدم بإدخالها.'}
          </p>
        </div>
      </div>
    </div>
  );
}
