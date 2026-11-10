import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { FileText, Plus, Trash2, X, AlertTriangle, CheckCircle, Camera } from 'lucide-react'; 
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Documents() {
  const { currentCar, t, lang } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({ type: 'insurance', endDate: '', image: null });
  const [deleteId, setDeleteId] = useState(null);

  const loadData = () => {
    if (currentCar) {
      const allDocs = dbService.getDocuments() || [];
      const carDocs = allDocs
        .filter(d => d.carId === currentCar.id)
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
      setDocuments(carDocs);
    } else {
      setDocuments([]); 
    }
  };

  useEffect(() => { loadData(); }, [currentCar]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً! يرجى اختيار صورة أصغر من 1.5 ميجابايت لتجنب امتلاء مساحة التخزين.');
        e.target.value = null; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCar) return;
    
    try {
      const newRecord = dbService.addDocument({ 
        carId: currentCar.id, 
        type: formData.type, 
        endDate: formData.endDate,
        image: formData.image
      });

      if (newRecord) {
        setShowForm(false);
        setFormData({ type: 'insurance', endDate: '', image: null }); 
        loadData(); 
      }
    } catch (error) {
      console.error("خطأ في حفظ الوثيقة:", error);
      alert("حدث خطأ أثناء محاولة الحفظ. قد تكون مساحة التخزين ممتلئة.");
    }
  };

  const handleDelete = () => {
    if(deleteId) {
      dbService.deleteDocument(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  const getStatus = (endDate) => {
    if(!endDate) return { label: '—', color: 'text-slate-400', bg: 'bg-slate-800', icon: FileText };
    const diffDays = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: t('expired') || 'منتهية', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
    }
    if (diffDays <= 30) {
      return { label: `${t('expiringSoon') || 'تنتهي قريباً'} (${diffDays} ${t('days') || 'يوم'})`, color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: AlertTriangle };
    }
    return { label: t('valid') || 'صالح', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
    return new Date(dateString).toLocaleDateString(localeMap[lang] || 'ar-MA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 pb-24 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('documents') || 'الوثائق'}</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`p-3 rounded-full text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--primary)] hover:bg-blue-600'}`}
        >
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] space-y-4 shadow-lg animate-fade-in mb-6">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('documentType') || 'نوع الوثيقة'}</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})} 
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]"
            >
              <option value="insurance">{t('insurance') || 'تأمين'}</option>
              <option value="technicalInspection">{t('technicalInspection') || 'فحص تقني'}</option>
              <option value="license">{t('license') || 'رخصة'}</option>
            </select>
          </div>
          
          <div>
             <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate') || 'تاريخ الانتهاء'}</label>
             <input 
                type="date" 
                required 
                value={formData.endDate} 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" 
              />
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('documentImage') || 'صورة الوثيقة (اختياري)'}</label>
            <label className="flex flex-col items-center justify-center w-full h-32 bg-[var(--surface-2)] border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--surface)] hover:border-[var(--primary)]/50 transition-colors overflow-hidden relative">
              {formData.image ? (
                <>
                  <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">تغيير الصورة</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-[var(--text-muted)]">
                  <Camera size={28} className="mb-2" />
                  <span className="text-xs font-bold">اضغط لإضافة صورة</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">
            {t('save') || 'حفظ الوثيقة'}
          </button>
        </form>
      )}

      {documents.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <FileText size={48} className="opacity-40" />
          </div>
          <p>{t('noDocuments') || 'لا توجد وثائق مسجلة.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const status = getStatus(doc.endDate);
            const StatusIcon = status.icon;
            
            return (
              <div key={doc.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex justify-between items-center transition-colors hover:border-[var(--primary)]/30">
                <div className="flex items-center gap-3">
                  {doc.image ? (
                    <div className="w-12 h-12 rounded-xl border border-[var(--border)] overflow-hidden flex-shrink-0">
                      <img src={doc.image} alt="doc" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bg} ${status.color}`}>
                      <StatusIcon size={24} />
                    </div>
                  )}
                  
                  <div>
                    <p className="font-bold text-[var(--text)] text-base">{t(doc.type) || doc.type}</p>
                    <p className={`text-[11px] font-bold mt-0.5 ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">
                    {t('endsOn') || 'ينتهي في'}: <br/>
                    <span className="font-bold text-[var(--text)] bg-[var(--surface-2)] px-2 py-0.5 rounded inline-block mt-0.5">{formatDate(doc.endDate)}</span>
                  </p>
                  <button 
                    onClick={() => setDeleteId(doc.id)} 
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                  >
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
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف هذه الوثيقة؟ لا يمكن التراجع عن هذا الإجراء.'}
        variant="danger"
        confirmText="نعم، احذف"
      />
    </div>
  );
}
