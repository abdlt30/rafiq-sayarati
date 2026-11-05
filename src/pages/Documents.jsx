import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Shield, Trash2, X, Edit2, FileText } from 'lucide-react';

export default function Documents() {
  const { currentCar } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ type: 'تأمين', endDate: '' });

  const docTypes = ['تأمين', 'فحص تقني', 'رخصة', 'أخرى'];

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
          
          {/* أزرار النوع بدلاً من القائمة البيضاء */}
          <div className="grid grid-cols-2 gap-2">
            {docTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, type})}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  formData.type === type 
                    ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--text)]' 
                    : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}
              >
                <FileText size={16} /> {type}
              </button>
            ))}
          </div>

          <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[var(--primary)] text-white font-bold py-3 rounded-xl">حفظ</button>
            <button type="button" onClick={closeForm} className="flex-1 bg-[var(--surface-2)] text-[var(--text-muted)] font-bold py-3 rounded-xl">إلغاء</button>
          </div>
        </form>
      )}

      {/* عرض الوثائق ... (كما هو) */}
    </div>
  );
}
