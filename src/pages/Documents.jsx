import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { FileText, Plus, Shield, Trash2, X, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';

export default function Documents() {
  const { currentCar, t } = useContext(AppContext); // استدعاء دالة الترجمة
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
    dbService.addDocument({ carId: currentCar.id, ...formData });
    setShowForm(false);
    setFormData({ type: 'تأمين', endDate: '' });
    loadData();
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('documents')}</h1> {/* استخدام الترجمة */}
        <button onClick={() => setShowForm(!showForm)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg">
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] space-y-4">
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]">
            <option value="تأمين">تأمين</option>
            <option value="فحص تقني">فحص تقني</option>
            <option value="رخصة">رخصة</option>
            <option value="أخرى">أخرى</option>
          </select>
          <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark]" />
          <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl">حفظ</button>
        </form>
      )}

      {/* الحالة الفارغة (إصلاح الشاشة السوداء) */}
      {documents.length === 0 ? (
        <div className="text-center mt-20 flex flex-col items-center">
          <div className="w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center mb-4">
            <FileText size={40} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-bold mb-2">{t('noDocuments')}</h3>
          <p className="text-[var(--text-muted)] text-sm mb-4">{t('noDocumentsText')}</p>
          <button onClick={() => setShowForm(true)} className="bg-[var(--primary)] text-white px-6 py-2 rounded-xl text-sm font-bold">
            + {t('addDocument')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const status = getStatus(doc.endDate);
            return (
              <div key={doc.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}><Shield size={20} /></div>
                  <div>
                    <p className="font-bold">{doc.type}</p>
                    <p className={`text-xs ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-[var(--text-muted)]">ينتهي: <span className="font-mono text-[var(--text)]">{doc.endDate}</span></p>
                  <div className="flex gap-2">
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
