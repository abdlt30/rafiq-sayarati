import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { ArrowRight, Printer } from 'lucide-react';

export default function PrintData() {
  const { currentCar, t, lang, currency } = useContext(AppContext);

  // تجميع البيانات وترجمتها
  const data = useMemo(() => {
    if (!currentCar) return [];
    const fuel = dbService.getFuel().filter(f => f.carId === currentCar.id).map(f => ({ ...f, type: t('fuel') || 'وقود', cost: f.cost }));
    const maint = dbService.getMaintenance().filter(m => m.carId === currentCar.id).map(m => ({ ...m, type: t(m.type) || m.type, cost: m.cost }));
    const exp = dbService.getExpenses().filter(e => e.carId === currentCar.id).map(e => ({ ...e, type: t(e.type) || e.type, cost: e.cost }));
    const inc = dbService.getIncomes().filter(i => i.carId === currentCar.id).map(i => ({ ...i, type: t(i.type) || i.type, cost: i.amount }));
    return [...fuel, ...maint, ...exp, ...inc].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [currentCar, t]);

  if (!currentCar) return null;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-white text-black p-4">
      
      {/* شريط التحكم (يختفي عند الطباعة) */}
      <div className="no-print flex items-center justify-between mb-8 pb-4 border-b">
        <Link to="/backup" className="p-2 bg-gray-100 rounded-xl">
          <ArrowRight size={20} className={`text-black ${dir === 'ltr' ? 'rotate-180' : ''}`} />
        </Link>
        <h1 className="text-xl font-bold">{t('printData') || 'طباعة البيانات'}</h1>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg">
          <Printer size={16} /> {t('print') || 'طباعة'}
        </button>
      </div>

      <h2 className="text-2xl font-black mb-4 text-center">{t('appName') || 'رفيق سيارتي'}</h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        {currentCar.make} {currentCar.model} - {currentCar.plate || ''}
      </p>

      <table className="w-full text-sm border-collapse" style={{ direction: dir }}>
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-800">
            <th className="p-2 border border-gray-300 text-start">{t('date') || 'التاريخ'}</th>
            <th className="p-2 border border-gray-300 text-start">{t('type') || 'النوع'}</th>
            <th className="p-2 border border-gray-300 text-start">{t('amount') || 'المبلغ'}</th>
            <th className="p-2 border border-gray-300 text-start">{t('odometer') || 'العداد'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="p-2 border border-gray-300">{row.date}</td>
              <td className="p-2 border border-gray-300">{row.type}</td>
              <td className="p-2 border border-gray-300 font-bold">{Number(row.cost).toLocaleString()} {currency}</td>
              <td className="p-2 border border-gray-300">{row.odometer ? Number(row.odometer).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
