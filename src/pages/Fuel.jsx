import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Edit2, Trash2 } from 'lucide-react';

export default function Fuel() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ date: '', odometer: '', liters: '', cost: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getFuelRecords());
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
      setRecords(dbService.updateFuelRecord(editingId, data));
    } else {
      setRecords([dbService.addFuelRecord(data), ...records]);
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm('هل أنت متأكد من حذف هذه التعبئة؟')) {
      setRecords(dbService.deleteFuelRecord(id));
    }
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

  return (
    <div className="space-y-4 pb-20">
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
          <Card key={record.id} className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-bold text-lg">{record.cost} <span className="text-sm text-slate-400">MAD</span></p>
                <p className="text-slate-400 text-xs mt-1">{record.date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(record)} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 p-2 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 p-2 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-slate-300 bg-dark-900/50 p-2 rounded-lg w-fit">
              <span>{record.liters} L</span>
              <span>•</span>
              <span>{record.odometer} KM</span>
            </div>
          </Card>
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
    </div>
  );
}
