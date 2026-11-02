import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function Fuel() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // حالة النموذج
  const [formData, setFormData] = useState({ date: '', odometer: '', liters: '', cost: '' });

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getFuelRecords());
    }
  }, [currentCar]);

  const handleAddFuel = (e) => {
    e.preventDefault();
    const newRecord = {
      carId: currentCar.id,
      date: formData.date,
      odometer: Number(formData.odometer),
      liters: Number(formData.liters),
      cost: Number(formData.cost)
    };
    dbService.addFuelRecord(newRecord);
    setRecords(dbService.getFuelRecords()); // تحديث القائمة
    setIsModalOpen(false); // إغلاق النافذة
    setFormData({ date: '', odometer: '', liters: '', cost: '' }); // تفريغ النموذج
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">سجل الوقود</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-500 text-white p-2 rounded-full shadow-lg">
          +
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">لا توجد سجلات وقود بعد.</div>
      ) : (
        records.map(record => (
          <Card key={record.id} className="flex justify-between items-center">
            <div>
              <p className="text-white font-bold">{record.cost} MAD</p>
              <p className="text-slate-400 text-sm">{record.date}</p>
            </div>
            <div className="text-right">
              <p className="text-brand-500 font-bold">{record.liters} L</p>
              <p className="text-slate-400 text-sm">{record.odometer} KM</p>
            </div>
          </Card>
        ))
      )}

      {/* نافذة الإضافة */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة تعبئة">
        <form onSubmit={handleAddFuel} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          <Input label="العداد (KM)" type="number" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} required />
          <Input label="اللترات" type="number" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} required />
          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Button type="submit">حفظ</Button>
        </form>
      </Modal>
    </div>
  );
}
