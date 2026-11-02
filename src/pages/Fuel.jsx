// ... (نفس الاستدعاءات السابقة)
import { Fuel as FuelIcon } from 'lucide-react';

// ... (داخل الـ return)
      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">لا توجد سجلات وقود بعد.</div>
      ) : (
        records.map(record => (
          <Card key={record.id} className="flex justify-between items-center p-4">
            <div className="flex items-center gap-4">
              <div className="bg-dark-900 p-3 rounded-xl border border-dark-700">
                <FuelIcon className="text-red-500" size={24} />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{record.cost} MAD</p>
                <p className="text-slate-400 text-xs">{record.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-brand-500 font-bold">{record.liters} L</p>
              <p className="text-slate-400 text-xs">{record.odometer} KM</p>
            </div>
          </Card>
        ))
      )}
// ... (باقي الكود)
