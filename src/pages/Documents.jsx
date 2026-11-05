import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { FileText, Plus, Shield, Trash2, X, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';

export default function Documents() {
  const { currentCar } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ type: 'تأمين', endDate: '' });

  const loadData = () => {
    if (currentCar) {
      const carDocs = dbService.getDocuments().filter(d => d.carId === currentCar.id).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
      setDocuments(carDocs);
    }
  };

  useEffect(() => { loadData(); }, [currentCar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCar) return;
    if (editingId) {
      dbService.updateDocument(editingId, formData);
    } else {
      dbService.addDocument({ carId: currentCar.id, ...formData });
    }
    closeForm();
    loadData();
  };

  const openEdit = (doc) => {
    setEditingId(doc.id);
    setFormData({ type: doc.type, endDate: doc.endDate });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ type: 'تأمين', endDate: '' });
  };

  const handleDelete = (id) => {
    if(window.confirm('هل أنت متأكد من الحذف؟')) {
      dbService.deleteDocument(id);
      loadData();
    }
  };

  const getStatus = (endDate) => {
    if(!endDate) return { label: 'غير محدد', color: 'text-slate-400', bg: 'bg-slate-800' };
    const diffDays = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'منتهية', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (diffDays <= 30) return { label: `تنتهي بعد ${diffDays} يوم`, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'صالحة', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">الوثائق</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg">
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-[var(--text)]">{editingId ? 'تعديل وثيقة' : 'إضافة وثيقة'}</h2>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none">
            <option value="تأمين">تأمين</option>
            <option value="فحص تقني">فحص تقني</option>
            <option value="رخصة">رخصة</option>
            <option value="أخرى">أخرى</option>
          </select>
          <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[var(--primary)] text-white font-bold py-3 rounded-xl">حفظ</button>
            <button type="button" onClick={closeForm} className="flex-1 bg-[var(--surface-2)] text-[var(--text-muted)] font-bold py-3 rounded-xl">إلغاء</button>
          </div>
        </form>
      )}

      {documents.length === 0 ? (
        <div className="text-center mt-10 text-[var(--text-muted)]">لا توجد وثائق محفوظة.</div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const status = getStatus(doc.endDate);
            return (
              <div key={doc.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}><Shield size={20} /></div>
                  <div>
                    <p className="font-bold text-[var(--text)]">{doc.type}</p>
                    <p className={`text-xs ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-[var(--text-muted)]">ينتهي في: <span className="font-mono text-[var(--text)]">{doc.endDate}</span></p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(doc)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(doc.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
