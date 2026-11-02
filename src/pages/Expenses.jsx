import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Edit2, Trash2 } from 'lucide-react'; // أيقونات التعديل والحذف

export default function Expenses() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // حالة التعديل

  const [formData, setFormData] = useState({ date: '', type: 'تأمين', cost: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getExpenses());
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      carId: currentCar.id,
      date: formData.date,
      type: formData.type,
      cost: Number(formData.cost)
    };

    if (editingId) {
      // تعديل
      setRecords(dbService.updateExpense(editingId, data));
    } else {
      // إضافة جديدة
      setRecords([dbService.addExpense(data), ...records]);
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      setRecords(dbService.deleteExpense(id));
    }
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

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">المصاريف</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-500 text-white p-2 rounded-full shadow-lg">
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
                <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 p-2 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="bg-dark-900/50 px-3 py-2 rounded-lg text-brand-500 text-sm font-bold w-fit">
              {record.type}
            </div>
          </Card>
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "تعديل المصروف" : "إضافة مصروف"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          
          {/* قائمة منسدلة مخصصة (Custom Select) لتبدو احترافية */}
          <div className="flex flex-col gap-1 w-full mb-4">
            <label className="text-xs text-slate-400">نوع المصروف</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})} 
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 1rem center', backgroundSize: '0.8rem' }}
            >
              <option value="تأمين">تأمين</option>
              <option value="ضرائب">ضرائب</option>
              <option value="غسيل">غسيل</option>
              <option value="فحص سيارة">فحص سيارة</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Button type="submit">{editingId ? 'حفظ التعديلات' : 'إضافة'}</Button>
        </form>
      </Modal>
    </div>
  );
}
