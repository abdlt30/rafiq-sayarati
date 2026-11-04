import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import CustomSelect from '../components/ui/CustomSelect';
import { Edit2, Trash2 } from 'lucide-react';

export default function Expenses() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({ date: '', type: 'تأمين', cost: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getExpenses().filter(r => r.carId === currentCar.id));
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { carId: currentCar.id, ...formData, cost: Number(formData.cost) };
    
    if (editingId) {
      setRecords(dbService.updateExpense(editingId, data));
    } else {
      setRecords([dbService.addExpense(data), ...records]);
    }
    closeModal();
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, type: record.type, cost: record.cost });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'تأمين', cost: '' });
  };

  const confirmDelete = () => {
    if (deleteId) setRecords(dbService.deleteExpense(deleteId));
    setIsConfirmOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">المصاريف</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/30">
          +
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">لا توجد مصاريف مسجلة.</div>
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
                <button onClick={() => { setDeleteId(record.id); setIsConfirmOpen(true); }} className="text-red-400 hover:text-red-300 bg-red-400/10 p-2 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="bg-dark-900/50 px-3 py-2 rounded-lg text-blue-500 text-sm font-bold w-fit">
              {record.type}
            </div>
          </Card>
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "تعديل المصروف" : "إضافة مصروف"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          
          <CustomSelect 
            label="نوع المصروف"
            options={['تأمين', 'ضرائب', 'غسيل', 'فحص سيارة', 'أخرى']}
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val })}
          />

          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Button type="submit">{editingId ? 'حفظ التعديلات' : 'إضافة'}</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} message="هل أنت متأكد من حذف هذا المصروف؟" />
    </div>
  );
}
