import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Shield, FileText, Droplets, Wrench, CircleDollarSign } from 'lucide-react'; // أيقونات

// دالة مساعدة لإرجاع الأيقونة المناسبة
const getCategoryIcon = (type) => {
  switch (type) {
    case 'تأمين': return <Shield className="text-green-500" size={24} />;
    case 'ضرائب': return <FileText className="text-blue-500" size={24} />;
    case 'غسيل': return <Droplets className="text-cyan-500" size={24} />;
    case 'فحص سيارة': return <Wrench className="text-yellow-500" size={24} />;
    default: return <CircleDollarSign className="text-slate-400" size={24} />;
  }
};

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
    <div className="space-y-4 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">المصاريف</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-full shadow-lg shadow-brand-500/30 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">لا توجد مصاريف مسجلة.</div>
      ) : (
        records.map(record => (
          <Card key={record.id} className="flex justify-between items-center p-4">
            <div className="flex items-center gap-4">
              <div className="bg-dark-900 p-3 rounded-xl border border-dark-700">
                {getCategoryIcon(record.type)}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{record.cost} MAD</p>
                <p className="text-slate-400 text-xs">{record.date}</p>
              </div>
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
              <option value="فحص سيارة">فحص سيارة</option>
              <option value="زيوت">زيوت</option>
              <option value="إطارات">إطارات</option>
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
