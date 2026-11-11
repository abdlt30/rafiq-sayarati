import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { ArrowRight, Printer } from 'lucide-react';

export default function ReportPrint() {
  const { currentCar, t, currency, lang } = useContext(AppContext);
  const [period, setPeriod] = useState('all'); 

  // دالة لترجمة أنواع الصيانة
  const getMaintenanceTypeLabel = (type) => {
    const map = {
      oilChange: t('oilChange') || 'تغيير زيت',
      tires: t('tires') || 'إطارات',
      brakes: t('brakes') || 'فرامل',
      battery: t('battery') || 'بطارية',
      airFilter: t('airFilter') || 'فلتر هواء',
      fullInspection: t('fullInspection') || 'فحص شامل',
      other: t('otherMaintenance') || 'أخرى'
    };
    return map[type] || type;
  };

  const isInPeriod = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    if (period === 'all') return true;
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  };

  const data = useMemo(() => {
    if (!currentCar) return { fuel: [], maintenance: [], expenses: [], incomes: [] };
    const filterByCar = (arr) => (arr || []).filter(r => r.carId === currentCar.id && isInPeriod(r.date));
    return {
      fuel: filterByCar(dbService.getFuel()).sort((a, b) => new Date(b.date) - new Date(a.date)),
      maintenance: filterByCar(dbService.getMaintenance()).sort((a, b) => new Date(b.date) - new Date(a.date)),
      expenses: filterByCar(dbService.getExpenses()).sort((a, b) => new Date(b.date) - new Date(a.date)),
      incomes: filterByCar(dbService.getIncomes()).sort((a, b) => new Date(b.date) - new Date(a.date)),
    };
  }, [currentCar, period]);

  const totals = useMemo(() => {
    const sum = (arr, key) => arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
    const fuel = sum(data.fuel, 'cost');
    const maintenance = sum(data.maintenance, 'cost');
    const expenses = sum(data.expenses, 'cost');
    const income = sum(data.incomes, 'amount');
    const totalExpenses = fuel + maintenance + expenses;
    return { fuel, maintenance, expenses, income, totalExpenses, net: income - totalExpenses };
  }, [data]);

  if (!currentCar) return null;

  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      
      {/* شريط التحكم (يختفي عند الطباعة) */}
      <div className="no-print sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/reports" className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <ArrowRight size={20} className={`text-[var(--text)] ${dir === 'ltr' ? 'rotate-180' : ''}`} />
          </Link>
          <h1 className="text-lg font-bold text-[var(--text)]">{t('financialReport') || 'تقرير مالي'}</h1>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">
            <Printer size={16} /> {t('printPdf') || 'طباعة / PDF'}
          </button>
        </div>
        
        {/* فلتر الفترة */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { v: 'all', l: t('allPeriods') || 'كل الفترات' },
            { v: 'month', l: t('thisMonth') || 'هذا الشهر' },
            { v: 'year', l: t('thisYear') || 'هذه السنة' },
          ].map(p => (
            <button
              key={p.v}
              onClick={() => setPeriod(p.v)}
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

      {/* =========== التقرير القابل للطباعة =========== */}
      <div className="print-container bg-white text-black p-6 sm:p-10 mx-auto max-w-4xl my-4 shadow-2xl rounded-2xl" style={{ direction: dir }}>
        
        {/* الترويسة */}
        <div className="flex justify-between items-center border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">🚗</div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">{t('appName') || 'رفيق سيارتي'}</h1>
              <p className="text-sm font-bold text-blue-600">{t('comprehensiveFinancialReport') || 'تقرير مالي شامل'}</p>
            </div>
          </div>
          <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('issueDate') || 'تاريخ الإصدار'}</p>
            <p className="text-sm font-black text-gray-900">{today}</p>
          </div>
        </div>

        {/* معلومات السيارة */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-bold mb-1">{t('car') || 'السيارة'}</p>
            <p className="text-2xl font-black text-gray-900">{currentCar.make} {currentCar.model} <span className="text-gray-400 text-lg">({currentCar.year})</span></p>
          </div>
          <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
            {/* ✅ إصلاح: استخدام t('plate') بدلاً من t('plateNumber') */}
            {currentCar.plate && <p className="text-sm text-gray-700 mb-1">{t('plate') || 'اللوحة'}: <span className="font-mono font-bold bg-white px-2 py-1 border border-gray-300 rounded">{currentCar.plate}</span></p>}
            {currentCar.odometer && <p className="text-sm text-gray-700">{t('odometer') || 'العداد'}: <span className="font-bold">{Number(currentCar.odometer).toLocaleString()} KM</span></p>}
          </div>
        </div>

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
            <div className="col-span-2 border-2 border-gray-900 rounded-xl p-5 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-300 font-bold mb-1">{t('netProfit') || 'صافي الربح'}</p>
                <p className={`text-4xl font-black ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`} dir="ltr">
                  {totals.net >= 0 ? '+' : ''}{totals.net.toLocaleString()} {currency}
                </p>
              </div>
              <div className="text-5xl opacity-20">💰</div>
            </div>
          </div>
        </div>

        {/* تفصيل المصاريف */}
        <div className="mb-8 page-break">
          <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-blue-600`}>
            {t('expenseDistribution') || 'تفصيل المصاريف'}
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="p-3 text-start font-bold text-gray-700">{t('category') || 'الفئة'}</th>
                <th className="p-3 text-start font-bold text-gray-700">{t('amount') || 'المبلغ'}</th>
                <th className="p-3 text-start font-bold text-gray-700">{t('percentage') || 'النسبة'}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200"><td className="p-3">{t('fuel') || 'الوقود'}</td><td className="p-3 font-bold" dir="ltr">{totals.fuel.toLocaleString()} {currency}</td><td className="p-3">{totals.totalExpenses > 0 ? ((totals.fuel / totals.totalExpenses) * 100).toFixed(1) : 0}%</td></tr>
              <tr className="border-b border-gray-200"><td className="p-3">{t('maintenance') || 'الصيانة'}</td><td className="p-3 font-bold" dir="ltr">{totals.maintenance.toLocaleString()} {currency}</td><td className="p-3">{totals.totalExpenses > 0 ? ((totals.maintenance / totals.totalExpenses) * 100).toFixed(1) : 0}%</td></tr>
              <tr className="border-b border-gray-200"><td className="p-3">{t('otherExpenses') || 'مصاريف أخرى'}</td><td className="p-3 font-bold" dir="ltr">{totals.expenses.toLocaleString()} {currency}</td><td className="p-3">{totals.totalExpenses > 0 ? ((totals.expenses / totals.totalExpenses) * 100).toFixed(1) : 0}%</td></tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr><td className="p-3 font-black">{t('total') || 'الإجمالي'}</td><td className="p-3 font-black text-red-600" dir="ltr">{totals.totalExpenses.toLocaleString()} {currency}</td><td className="p-3 font-black">100%</td></tr>
            </tfoot>
          </table>
        </div>

        {/* سجل الوقود */}
        {data.fuel.length > 0 && (
          <div className="mb-8 page-break">
            <h2 className={`text-xl font-black text-gray-900 mb-4 ${dir === 'rtl' ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} border-blue-600`}>
              {t('fuelLog') || 'سجل الوقود'} ({data.fuel.length})
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-2 text-start">{t('date') || 'التاريخ'}</th>
                  <th className="p-2 text-start">{t('odometer') || 'العداد'}</th>
                  <th className="p-2 text-start">{t('liters') || 'اللترات'}</th>
                  <th className="p-2 text-start">{t('cost') || 'التكلفة'}</th>
                </tr>
              </thead>
              <tbody>
                {data.fuel.map(f => (
                  <tr key={f.id} className="border-b border-gray-200">
                    <td className="p-2">{f.date}</td>
                    <td className="p-2">{Number(f.odometer).toLocaleString()}</td>
                    <td className="p-2">{f.liters} L</td>
                    <td className="p-2 font-bold" dir="ltr">{Number(f.cost).toLocaleString()} {currency}</td>
                  </tr>
                ))}
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
                  <th className="p-2 text-start">{t('date') || 'التاريخ'}</th>
                  <th className="p-2 text-start">{t('maintenanceType') || 'النوع'}</th>
                  <th className="p-2 text-start">{t('cost') || 'التكلفة'}</th>
                </tr>
              </thead>
              <tbody>
                {data.maintenance.map(m => (
                  <tr key={m.id} className="border-b border-gray-200">
                    <td className="p-2">{m.date}</td>
                    <td className="p-2">{getMaintenanceTypeLabel(m.type)}</td>
                    <td className="p-2 font-bold" dir="ltr">{Number(m.cost).toLocaleString()} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* التذييل */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
          <p className="font-bold mb-1">{t('reportFooter1') || 'تم إنشاء هذا التقرير بواسطة تطبيق رفيق سيارتي'}</p>
          <p>{t('reportFooter2') || 'هذا التقرير تم توليده آلياً بناءً على البيانات التي قام المستخدم بإدخالها.'}</p>
        </div>
      </div>
    </div>
  );
}
