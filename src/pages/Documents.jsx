import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { FileText, Plus, Shield, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react'; 
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Documents() {
  const { currentCar, t, lang } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // حفظ "المفتاح" وليس النص المترجم
  const [formData, setFormData] = useState({ type: 'insurance', endDate: '' });
  const [deleteId, setDeleteId] = useState(null);

  const loadData = () => {
    if (currentCar) {
      // ✅ إصلاح حرج: إضافة ?. و || [] لمنع انهيار التطبيق إذا كانت قاعدة البيانات فارغة
      const allDocs = dbService.getDocuments() || [];
      const carDocs = allDocs
        .filter(d => d.carId === currentCar.id)
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate)); // الأقرب انتهاءً أولاً
      setDocuments(carDocs);
    } else {
      setDocuments([]); // تصفير القائمة إذا لم تكن هناك سيارة
    }
  };

  useEffect(() => { loadData(); }, [currentCar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCar) return;
    
    try {
      const newRecord = dbService.addDocument({ 
        carId: currentCar.id, 
        type: formData.type, 
        endDate: formData.endDate 
      });

      if (newRecord) {
        setShowForm(false);
        setFormData({ type: 'insurance', endDate: '' });
        loadData(); // إعادة تحميل البيانات لتظهر فوراً
      }
    } catch (error) {
      console.error("خطأ في حفظ الوثيقة:", error);
      alert("حدث خطأ أثناء محاولة الحفظ.");
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
    
    // حساب الفرق بالأيام
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
    <div className="space-y-4 pb-24 px-4">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('documents') || 'الوثائق'}</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        >
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {/* نموذج الإضافة */}
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

          <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
            {t('save') || 'حفظ الوثيقة'}
          </button>
        </form>
      )}

      {/* قائمة الوثائق */}
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
              <div key={doc.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex justify-between items-center transition-colors hover:border-[var(--primary)]/30">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}>
                    <StatusIcon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-lg">{t(doc.type) || doc.type}</p>
                    <p className={`text-xs font-bold mt-0.5 ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-[var(--text-muted)] font-medium">
                    {t('endsOn') || 'ينتهي في'}: <span className="font-bold text-[var(--text)] bg-[var(--surface-2)] px-2 py-0.5 rounded">{formatDate(doc.endDate)}</span>
                  </p>
                  <button onClick={() => setDeleteId(doc.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
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
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف هذه الوثيقة؟'}
      />
    </div>
  );
}
