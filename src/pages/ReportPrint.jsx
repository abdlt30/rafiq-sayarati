import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { ArrowRight, Printer, TrendingUp } from 'lucide-react';

export default function ReportPrint() {
  const { currentCar, t, currency, lang } = useContext(AppContext);
  const [period, setPeriod] = useState('all'); 

  // فلترة البيانات حسب الفترة
  const isInPeriod = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    if (period === 'all') return true;
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  };

  // جلب البيانات
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

  // الحسابات
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

  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      
      {/* شريط التحكم (يختفي عند الطباعة) */}
      <div className="no-print sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Link to="/reports" className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <ArrowRight size={20} className="text-[var(--text)]" />
          </Link>
          <h1 className="text-lg font-bold text-[var(--text)]">تقرير مالي</h1>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold text-sm">
            <Printer size={16} /> طباعة / PDF
          </button>
        </div>
        
        {/* فلتر الفترة */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { v: 'all', l: 'كل الفترات' },
            { v: 'month', l: 'هذا الشهر' },
            { v: 'year', l: 'هذه السنة' },
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
      <div className="print-container bg-white text-black p-6 sm:p-10 mx-auto max-w-4xl my-4" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        
        {/* الترويسة */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">رفيق سيارتي</h1>
            <p className="text-sm text-gray-600">تقرير مالي شامل</p>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500">تاريخ الإصدار</p>
            <p className="text-sm font-bold text-gray-900">{today}</p>
          </div>
        </div>

        {/* معلومات السيارة */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">السيارة</p>
          <p className="text-xl font-bold text-gray-900">{currentCar.make} {currentCar.model} {currentCar.year ? `(${currentCar.year})` : ''}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-700">
            {currentCar.plate && <span>اللوحة: <b>{currentCar.plate}</b></span>}
            {currentCar.odometer && <span>العداد: <b>{Number(currentCar.odometer).toLocaleString()} KM</b></span>}
          </div>
        </div>

        {/* الملخص المالي */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">الملخص المالي</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">إجمالي الإيرادات</p>
              <p className="text-xl font-black text-green-600">+ {totals.income.toLocaleString()} {currency}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">إجمالي المصاريف</p>
              <p className="text-xl font-black text-red-600">- {totals.totalExpenses.toLocaleString()} {currency}</p>
            </div>
            <div className="col-span-2 border-2 border-gray-800 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-1">صافي الربح</p>
              <p className={`text-3xl font-black ${totals.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totals.net >= 0 ? '+' : ''}{totals.net.toLocaleString()} {currency}
              </p>
            </div>
          </div>
        </div>

        {/* تفصيل المصاريف */}
        <div className="mb-6 page-break">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">تفصيل المصاريف</h2>
          <table className="w-full text-sm">
            <thead>
              <tr><th>الفئة</th><th>المبلغ</th><th>النسبة</th></tr>
            </thead>
            <tbody>
              <tr><td>الوقود</td><td className="font-bold">{totals.fuel.toLocaleString()} {currency}</td><td>{totals.totalExpenses > 0 ? ((totals.fuel / totals.totalExpenses) * 100).toFixed(1) : 0}%</td></tr>
              <tr><td>الصيانة</td><td className="font-bold">{totals.maintenance.toLocaleString()} {currency}</td><td>{totals.totalExpenses > 0 ? ((totals.maintenance / totals.totalExpenses) * 100).toFixed(1) : 0}%</td></tr>
              <tr><td>مصاريف أخرى</td><td className="font-bold">{totals.expenses.toLocaleString()} {currency}</td><td>{totals.totalExpenses > 0 ? ((totals.expenses / totals.totalExpenses) * 100).toFixed(1) : 0}%</td></tr>
            </tbody>
            <tfoot>
              <tr><td className="font-bold">الإجمالي</td><td className="font-black">{totals.totalExpenses.toLocaleString()} {currency}</td><td className="font-bold">100%</td></tr>
            </tfoot>
          </table>
        </div>

        {/* سجل الوقود */}
        {data.fuel.length > 0 && (
          <div className="mb-6 page-break">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">سجل الوقود ({data.fuel.length} عملية)</h2>
            <table className="w-full text-xs">
              <thead><tr><th>التاريخ</th><th>العداد</th><th>اللترات</th><th>التكلفة</th></tr></thead>
              <tbody>
                {data.fuel.map(f => (
                  <tr key={f.id}>
                    <td>{f.date}</td>
                    <td>{Number(f.odometer).toLocaleString()}</td>
                    <td>{f.liters} L</td>
                    <td className="font-bold">{Number(f.cost).toLocaleString()} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* سجل الصيانة */}
        {data.maintenance.length > 0 && (
          <div className="mb-6 page-break">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">سجل الصيانة ({data.maintenance.length} عملية)</h2>
            <table className="w-full text-xs">
              <thead><tr><th>التاريخ</th><th>النوع</th><th>التكلفة</th></tr></thead>
              <tbody>
                {data.maintenance.map(m => (
                  <tr key={m.id}>
                    <td>{m.date}</td>
                    <td>{m.type}</td>
                    <td className="font-bold">{Number(m.cost).toLocaleString()} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* التذييل */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>تم إنشاء هذا التقرير بواسطة تطبيق رفيق سيارتي</p>
          <p className="mt-1">هذا التقرير تم توليده آلياً بناءً على البيانات التي قام المستخدم بإدخالها.</p>
        </div>
      </div>
    </div>
  );
}
