import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Edit2, Trash2, Fuel } from 'lucide-react';

export default function FuelPage() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const [formData, setFormData] = useState({ date: '', odometer: '', liters: '', cost: '' });

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getFuel().filter(r => r.carId === currentCar.id));
    }
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

    if (editingId) {
      setRecords(dbService.updateFuel(editingId, data));
    } else {
      setRecords([dbService.addFuel(data), ...records]);
    }
    closeModal();
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, odometer: record.odometer, liters: record.liters, cost: record.cost });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', odometer: '', liters: '', cost: '' });
  };

  const confirmDelete = () => {
    if (deleteId) setRecords(dbService.deleteFuel(deleteId));
    setIsConfirmOpen(false);
  };

  // حسابات الإحصائيات
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const avgPrice = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0.00';
  
  let consumption = '0.0';
  if (records.length > 1) {
    const sorted = [...records].sort((a, b) => b.odometer - a.odometer);
    const distance = sorted[0].odometer - sorted[1].odometer;
    if (distance > 0) {
      consumption = ((sorted[0].liters / distance) * 100).toFixed(1);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-white">سجل الوقود</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/30">
          <Fuel size={24} />
        </button>
      </div>

      {/* إحصائيات الوقود */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-1">التكلفة</span>
          <span className="text-sm font-bold text-white">{totalCost} MAD</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-1">اللترات</span>
          <span className="text-sm font-bold text-white">{totalLiters.toFixed(1)} L</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-[10px] text-slate-400 block mb-1">الاستهلاك</span>
          <span className="text-sm font-bold text-white">{consumption} L/100</span>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">لا توجد سجلات وقود.</div>
      ) : (
        records.map(record => (
          <div key={record.id} className="card flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-bold text-lg">{record.cost} <span className="text-xs text-slate-400">MAD</span></p>
                <p className="text-slate-400 text-xs mt-1">{record.date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(record)} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 p-2 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => { setDeleteId(record.id); setIsConfirmOpen(true); }} className="text-red-400 hover:text-red-300 bg-red-400/10 p-2 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {/* إصلاح تنسيق النصوص */}
            <div className="flex justify-between items-center bg-dark-900/50 p-2 rounded-lg text-xs text-slate-300">
              <span>{record.liters} L</span>
              <span className="text-slate-600">|</span>
              <span>{record.odometer.toLocaleString()} KM</span>
            </div>
          </div>
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "تعديل تعبئة" : "إضافة تعبئة"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          <Input label="العداد (KM)" type="number" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} required />
          <Input label="اللترات" type="number" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} required />
          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Button type="submit">{editingId ? 'حفظ التعديلات' : 'إضافة'}</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} message="هل أنت متأكد من حذف هذه التعبئة؟" />
    </div>
  );
}
