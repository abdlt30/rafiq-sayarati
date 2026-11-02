import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function Expenses() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ date: '', type: 'تأمين', cost: '' });

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getExpenses());
    }
  }, [currentCar]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    const newRecord = {
      carId: currentCar.id,
      date: formData.date,
      type: formData.type,
      cost: Number(formData.cost)
    };
    dbService.addExpense(newRecord);
    setRecords(dbService.getExpenses());
    setIsModalOpen(false);
    setFormData({ date: '', type: 'تأمين', cost: '' });
  };

  return (
    <div className="space-y-4">
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
          <Card key={record.id} className="flex justify-between items-center">
            <div>
              <p className="text-white font-bold">{record.cost} MAD</p>
              <p className="text-slate-400 text-sm">{record.date}</p>
            </div>
            <div className="text-right">
              <p className="text-brand-500 font-bold">{record.type}</p>
            </div>
          </Card>
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة مصروف">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          <div className="flex flex-col gap-1 w-full mb-4">
            <label className="text-xs text-slate-400">نوع المصروف</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500">
              <option value="تأمين">تأمين</option>
              <option value="ضرائب">ضرائب</option>
              <option value="غسيل">غسيل</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Button type="submit">حفظ</Button>
        </form>
      </Modal>
    </div>
  );
}
