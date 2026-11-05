import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

export default function Expenses() {
  const { currentCar, t } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', type: 'تأمين', cost: '' });

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getExpenses().filter(r => r.carId === currentCar.id));
    }
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

  const handleDelete = (id) => {
    if(window.confirm(t('confirmDelete'))) {
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
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('expenses')}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg">
          <Plus size={24} />
        </button>
      </div>

      {records.map(record => (
        <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-bold text-lg">{record.cost} <span className="text-sm text-[var(--text-muted)]">MAD</span></p>
              <p className="text-[var(--text-muted)] text-xs mt-1">{record.date}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(record)} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
          <div className="bg-[var(--surface-2)] px-3 py-2 rounded-lg text-[var(--primary)] text-sm font-bold w-fit">
            {record.type}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl w-full max-w-md space-y-4 relative border border-[var(--border)]">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 text-[var(--text-muted)]"><X size={20} /></button>
            <h2 className="text-xl font-bold text-center mb-4">{editingId ? t('edit') : t('addExpense')}</h2>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark]" />
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]">
              <option value="تأمين">تأمين</option>
              <option value="ضرائب">ضرائب</option>
              <option value="غسيل">غسيل</option>
              <option value="أخرى">أخرى</option>
            </select>
            <input type="number" placeholder={t('amount')} required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]" />
            <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl">{t('save')}</button>
          </form>
        </div>
      )}
    </div>
  );
}
