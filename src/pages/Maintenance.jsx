import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Wrench, Trash2, Edit2 } from 'lucide-react';

export default function Maintenance() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ date: '', type: 'تغيير زيت', cost: '', notes: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getMaintenance().filter(r => r.carId === currentCar.id));
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { carId: currentCar.id, ...formData, cost: Number(formData.cost) };
    setRecords([dbService.addMaintenance(data), ...records]);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) setRecords(dbService.deleteMaintenance(deleteId));
    setIsConfirmOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">الصيانة</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/30">
          +
        </button>
      </div>

      {/* بطاقة الإحصائيات */}
      <div className="card flex justify-around items-center p-4 bg-gradient-to-r from-blue-900/40 to-transparent">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{records.length}</div>
          <div className="text-xs text-slate-400">إجمالي السجلات</div>
        </div>
        <div className="h-8 w-px bg-slate-700"></div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">{records.filter(r => r.type === 'تغيير زيت').length}</div>
          <div className="text-xs text-slate-400">تغيير زيت</div>
        </div>
      </div>

      {records.map(record => (
        <div key={record.id} className="card flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="row-ico bg-yellow-500/10 text-yellow-500"><Wrench size={20}/></div>
              <div>
                <h3 className="text-white font-bold">{record.type}</h3>
                <p className="text-slate-400 text-xs">{record.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setDeleteId(record.id); setIsConfirmOpen(true); }} className="text-red-400 p-2 bg-red-400/10 rounded-lg">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
          {record.notes && <p className="text-sm text-slate-300 bg-dark-900/50 p-2 rounded-lg">{record.notes}</p>}
          <div className="flex justify-end mt-2">
            <span className="text-blue-500 font-bold">{record.cost} MAD</span>
          </div>
        </div>
      ))}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة صيانة">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          <Input label="النوع" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
          <Input label="التكلفة" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Input label="ملاحظات" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          <Button type="submit">حفظ</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} message="هل أنت متأكد من الحذف؟" />
    </div>
  );
}
