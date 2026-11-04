import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import CustomSelect from '../components/ui/CustomSelect';
import { Edit2, Trash2 } from 'lucide-react';

export default function Maintenance() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({ date: '', type: 'تغيير زيت', cost: '', notes: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getMaintenance().filter(r => r.carId === currentCar.id));
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { carId: currentCar.id, ...formData, cost: Number(formData.cost) };
    
    if (editingId) {
      setRecords(dbService.updateMaintenance(editingId, data));
    } else {
      setRecords([dbService.addMaintenance(data), ...records]);
    }
    closeModal();
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, type: record.type, cost: record.cost, notes: record.notes || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'تغيير زيت', cost: '', notes: '' });
  };

  const confirmDelete = () => {
    if (deleteId) setRecords(dbService.deleteMaintenance(deleteId));
    setIsConfirmOpen(false);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'تغيير زيت': return '🛢️';
      case 'إطارات': return '🛞';
      case 'فرامل': return '🛑';
      case 'بطارية': return '🔋';
      case 'فحص شامل': return '🔍';
      default: return '🔧';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-white">الصيانة</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/30">
          +
        </button>
      </div>

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
              <div className="bg-dark-900 p-2 rounded-xl text-2xl">{getIcon(record.type)}</div>
              <div>
                <h3 className="text-white font-bold">{record.type}</h3>
                <p className="text-slate-400 text-xs">{record.date}</p>
              </div>
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
          {record.notes && <p className="text-sm text-slate-300 bg-dark-900/50 p-2 rounded-lg">{record.notes}</p>}
          <div className="flex justify-end mt-2">
            <span className="text-blue-500 font-bold">{record.cost} MAD</span>
          </div>
        </div>
      ))}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "تعديل الصيانة" : "إضافة صيانة"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          
          <CustomSelect 
            label="نوع الصيانة"
            options={['تغيير زيت', 'إطارات', 'فرامل', 'بطارية', 'فحص شامل', 'أخرى']}
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val })}
          />

          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Input label="ملاحظات (اختياري)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          <Button type="submit">{editingId ? 'حفظ التعديلات' : 'إضافة'}</Button>
        </form>
      </Modal>

      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} message="هل أنت متأكد من حذف سجل الصيانة؟" />
    </div>
  );
}
