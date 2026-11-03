import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Edit2, Trash2, Wrench } from 'lucide-react';

export default function Maintenance() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({ date: '', type: 'تغيير زيت', cost: '', notes: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getMaintenance());
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      carId: currentCar.id,
      date: formData.date,
      type: formData.type,
      cost: Number(formData.cost),
      notes: formData.notes
    };

    if (editingId) {
      setRecords(dbService.updateMaintenance(editingId, data));
    } else {
      setRecords([dbService.addMaintenance(data), ...records]);
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (deleteId) setRecords(dbService.deleteMaintenance(deleteId));
    setIsConfirmOpen(false);
    setDeleteId(null);
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

  // دالة لإرجاع أيقونة مناسبة لنوع الصيانة
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
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">الصيانة</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-500 text-white p-2 rounded-full shadow-lg">
          +
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">لا توجد سجلات صيانة.</div>
      ) : (
        records.map(record => (
          <Card key={record.id} className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-dark-900 p-2 rounded-xl text-2xl">{getIcon(record.type)}</div>
                <div>
                  <p className="text-white font-bold text-lg">{record.type}</p>
                  <p className="text-slate-400 text-xs mt-1">{record.date}</p>
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
            {record.notes && <p className="text-slate-400 text-sm bg-dark-900/50 p-2 rounded-lg">{record.notes}</p>}
            <div className="flex justify-end">
              <span className="text-brand-500 font-bold">{record.cost} MAD</span>
            </div>
          </Card>
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "تعديل الصيانة" : "إضافة صيانة"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="التاريخ" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          
          <div className="flex flex-col gap-1 w-full mb-4">
            <label className="text-xs text-slate-400">نوع الصيانة</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})} 
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="تغيير زيت">تغيير زيت</option>
              <option value="إطارات">إطارات</option>
              <option value="فرامل">فرامل</option>
              <option value="بطارية">بطارية</option>
              <option value="فحص شامل">فحص شامل</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <Input label="التكلفة (MAD)" type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
          <Input label="ملاحظات (اختياري)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          
          <Button type="submit">{editingId ? 'حفظ التعديلات' : 'إضافة'}</Button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={confirmDelete} 
        message="هل أنت متأكد من حذف سجل الصيانة؟"
      />
    </div>
  );
}
