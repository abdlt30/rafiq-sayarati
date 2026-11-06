import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wrench } from 'lucide-react';

export default function Maintenance() {
  const { currentCar, t } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ date: '', type: 'تغيير زيت', cost: '', nextKm: '', notes: '' });

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getMaintenance().filter(r => r.carId === currentCar.id));
    }
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { carId: currentCar.id, ...formData, cost: Number(formData.cost), nextKm: Number(formData.nextKm) || null };
    
    if (editingId) {
      setRecords(dbService.updateMaintenance(editingId, data));
    } else {
      setRecords([dbService.addMaintenance(data), ...records]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm(t('confirmDelete'))) {
      setRecords(dbService.deleteMaintenance(id));
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ date: record.date, type: record.type, cost: record.cost, nextKm: record.nextKm || '', notes: record.notes || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'تغيير زيت', cost: '', nextKm: '', notes: '' });
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('maintenance')}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg">
          <Plus size={24} />
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-10">لا توجد سجلات صيانة.</div>
      ) : (
        records.map(record => (
          <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500"><Wrench size={20}/></div>
                <div>
                  <p className="font-bold text-[var(--text)]">{record.type}</p>
                  <p className="text-xs text-[var(--text-muted)]">{record.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(record)} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="flex justify-between items-center bg-[var(--surface-2)] p-2 rounded-lg text-xs">
              <span className="text-[var(--text-muted)]">{record.nextKm ? `التغيير القادم: ${record.nextKm} KM` : 'لا توجد صيانة قادمة'}</span>
              <span className="font-bold text-[var(--primary)]">{record.cost} MAD</span>
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl w-full max-w-md space-y-4 relative border border-[var(--border)]">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 text-[var(--text-muted)]"><X size={20} /></button>
            <h2 className="text-xl font-bold text-center mb-4">{editingId ? t('edit') : t('addMaintenance')}</h2>
            
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark]" />
            
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] round

            <input type="number" placeholder="التكلفة (MAD)" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]" />
            <input type="number" placeholder="العداد للصيانة القادمة (KM)" value={formData.nextKm} onChange={e => setFormData({...formData, nextKm: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]" />
            
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]">
            <option value="تغيير زيت">تغيير زيت</option>
           <option value="إطارات">إطارات</option>
           <option value="فرامل">فرامل</option>
           <option value="بطارية">بطارية</option>
           <option value="فلتر هواء">فلتر هواء</option>
           <option value="فحص شامل">فحص شامل</option>
           <option value="أخرى">أخرى</option>
           </select>
          </form>
        </div>
      )}
    </div>
  );
}
