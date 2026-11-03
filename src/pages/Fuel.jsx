import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Edit2, Trash2, Fuel, Gauge } from 'lucide-react';

export default function FuelPage() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ date: '', odometer: '', liters: '', cost: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getFuel().filter(r => r.carId === currentCar.id));
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      carId: currentCar.id,
      date: formData.date,
      odometer: Number(formData.odometer),
      liters: Number(formData.liters),
      cost: Number(formData.cost)
    };
    setRecords([dbService.addFuel(data), ...records]);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) setRecords(dbService.deleteFuel(deleteId));
    setIsConfirmOpen(false);
  };

  // حسابات الإحصائيات
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const avgPrice = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0.00';
  
  // حساب الاستهلاك (L/100km)
  let consumption = '0.0';
  if (records.length > 1) {
    const sorted = [...records].sort((a, b) => b.odometer - a.odometer);
    const distance = sorted[0].odometer - sorted[1].odometer;
    if (distance > 0) {
      consumption = ((sorted[0].liters / distance) * 100).toFixed(1);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">سجل الوقود</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/30">
          +
        </button>
      </div>

      {/* إحصائيات الوقود */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <span className="text-xs text-slate-400 block mb-1">التكلفة</span>
          <span className="text-sm font-bold text-white">{totalCost} MAD</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xs text-slate-400 block mb-1">اللترات</span>
          <span className="text-sm font-bold text-white">{totalLiters.toFixed(1)} L</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xs text-slate-400 block mb-1">الاستهلاك</span>
          <span className="text-sm font-bold text-white">{consumption} L/100</span>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">لا توجد سجلات وقود.</div>
      ) : (
        records.map(record => (
          <div key={record.id} className="row">
            <div className="row-ico bg-blue-500/10 text-blue-500"><Fuel size={20}/></div>
            <div className="row-body">
              <div className="row-title text-white font-bold">{record.cost} MAD</div>
              <div className="row-sub text-slate-400 text-xs">{record.date}</div>
            </div>
            <div className="row-end flex flex-col items-end gap-1">
              <div className="text-xs text-slate-300">{record.liters} L • {record.odometer} KM</div>
              <button onClick={() => { setDeleteId(record.id); setIsConfirmOpen(true); }} className="text-red-400 text-xs mt-1">حذف</button>
            </div>
          </div>
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة تعبئة">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          <Input label="العداد (KM)" type="number" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} required />
          <Input label="اللترات" type="number" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} required />
          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Button type="submit">حفظ</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} message="هل أنت متأكد من الحذف؟" />
    </div>
  );
}
