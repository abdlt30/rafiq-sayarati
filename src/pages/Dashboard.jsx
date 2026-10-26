import React, { useEffect, useState } from 'react';
import { getVehicles, getExpensesByVehicle } from '../services/dataService';
import { initDB } from '../db/database';
import { Car, Gauge } from 'lucide-react';

export default function Dashboard() {
  const [vehicle, setVehicle] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      await initDB();
      const vehs = await getVehicles();
      if (vehs.length > 0) {
        const v = vehs[0];
        setVehicle(v);
        const exps = await getExpensesByVehicle(v.id);
        const total = exps.reduce((sum, e) => sum + Number(e.amount), 0);
        setTotalExpenses(total);
      }
    };
    loadData();
  }, []);

  if (!vehicle) return <div className="text-center mt-10 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-brand-600 to-purple-700 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">{vehicle.name}</h2>
              <p className="text-blue-100 text-sm">{vehicle.brand} {vehicle.model} • {vehicle.year}</p>
            </div>
            <Car size={40} className="text-white/50" />
          </div>
          <div className="mt-6 flex gap-4">
            <div className="bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Gauge size={16} />
              <span className="font-mono">{vehicle.odometer.toLocaleString()} KM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-800 p-4 rounded-2xl border border-dark-700">
          <p className="text-gray-400 text-sm mb-1">إجمالي المصاريف</p>
          <p className="text-2xl font-bold text-red-400">{totalExpenses.toLocaleString()} <span className="text-sm">MAD</span></p>
        </div>
        <div className="bg-dark-800 p-4 rounded-2xl border border-dark-700">
          <p className="text-gray-400 text-sm mb-1">تكلفة الكيلومتر</p>
          <p className="text-2xl font-bold text-yellow-400">
            {totalExpenses > 0 ? (totalExpenses / vehicle.odometer).toFixed(2) : '0.00'} <span className="text-sm">MAD</span>
          </p>
        </div>
      </div>
    </div>
  );
    }
