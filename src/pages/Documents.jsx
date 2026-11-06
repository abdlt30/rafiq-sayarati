import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { FileText, Plus, Shield, Trash2, X } from 'lucide-react'; // تم حذف الأيقونات غير المستخدمة
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Documents() {
  const { currentCar, t } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // تحديث القيمة الافتراضية لتكون مفتاح ترجمة بدلاً من نص ثابت
  const [formData, setFormData] = useState({ type: 'insurance', endDate: '' });
  
  const [deleteId, setDeleteId] = useState(null);

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
    // نقوم بحفظ النص المترجم في قاعدة البيانات لسهولة العرض لاحقاً
    dbService.addDocument({ carId: currentCar.id, type: t(formData.type), endDate: formData.endDate });
    setShowForm(false);
    setFormData({ type: 'insurance', endDate: '' });
    loadData();
  };

  const handleDelete = () => {
    if(deleteId) {
      dbService.deleteDocument(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  const getStatus = (endDate) => {
    if(!endDate) return { label: '—', color: 'text-slate-400', bg: 'bg-slate-800' };
    const diffDays = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: t('expired'), color: 'text-red-500', bg: 'bg-red-500/10' };
    if (diffDays <= 30) return { label: `${t('expiringSoon')} (${diffDays})`, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: t('valid'), color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('documents')}</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg">
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] space-y-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('documentType') || 'نوع الوثيقة'}</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none">
              <option value="insurance">{t('insurance') || 'تأمين'}</option>
              <option value="technicalInspection">{t('technicalInspection') || 'فحص تقني'}</option>
              <option value="license">{t('license') || 'رخصة'}</option>
            </select>
          </div>
          
          <div>
             <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate') || 'تاريخ الانتهاء'}</label>
             <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark] outline-none" />
          </div>

          <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl">{t('save') || 'حفظ'}</button>
        </form>
      )}

      {documents.length === 0 ? (
        <div className="text-center mt-20">
          <FileText size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">{t('noDocuments') || 'لا توجد وثائق مسجلة.'}</p>
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
                  <p className="text-xs text-[var(--text-muted)]">{t('endsOn') || 'ينتهي في'}: <span className="font-mono text-[var(--text)]">{doc.endDate}</span></p>
                  <button onClick={() => setDeleteId(doc.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        message={t('confirmDelete') || 'هل أنت متأكد من الحذف؟'}
      />
    </div>
  );
}
