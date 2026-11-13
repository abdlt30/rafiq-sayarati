import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { FileText, Plus, Trash2, X, AlertTriangle, CheckCircle, Camera, AlertCircle } from 'lucide-react'; 

// ✅ 1. تحديث المسارات إلى الهيكل الجديد (Shared)
import ConfirmModal from '../shared/components/ui/ConfirmModal';
import { formatDate } from '../shared/utils/formatters';

const EMPTY_FORM = { type: 'insurance', endDate: '', image: null };
const VALID_TYPES = ['insurance', 'technicalInspection', 'license'];
const MAX_FILE_SIZE = 1.5 * 1024 * 1024;   
const MAX_DIMENSION = 1200;                
const COMPRESS_QUALITY = 0.7;              
const MAX_DOCS_PER_CAR = 20;               

export default function Documents() {
  const { currentCar, t, lang, dataVersion, bumpDataVersion } = useContext(AppContext);
  
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const toastTimeoutRef = useRef(null);
  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  /* ===================== Toast ===================== */
  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  /* ===================== Load Data ===================== */
  const loadData = useCallback(() => {
    try {
      if (!currentCar) {
        setDocuments([]);
        return;
      }
      const allDocs = dbService.getDocuments() || [];
      // ✅ إصلاح أمني: استخدام String() للتطابق
      const carDocs = allDocs
        .filter(d => String(d.carId) === String(currentCar.id))
        .sort((a, b) => (a.endDate || '').localeCompare(b.endDate || ''));
      setDocuments(carDocs);
    } catch (e) {
      console.error('loadData failed:', e);
      setDocuments([]);
    }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  /* ===================== ضغط الصور ===================== */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read_failed'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('image_load_failed'));
        img.onload = () => {
          try {
            let w = img.width;
            let h = img.height;
            if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
              if (w > h) { h = Math.round((h * MAX_DIMENSION) / w); w = MAX_DIMENSION; }
              else { w = Math.round((w * MAX_DIMENSION) / h); h = MAX_DIMENSION; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('canvas_failed'));
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', COMPRESS_QUALITY));
          } catch (err) {
            reject(err);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  /* ===================== رفع صورة ===================== */
  const handleImageUpload = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(t('invalidFileType'), 'error');
      input.value = null;
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast(t('imageTooLarge'), 'error');
      input.value = null;
      return;
    }

    setIsProcessingImage(true);
    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error('image processing failed:', err);
      showToast(t('imageProcessingFailed'), 'error');
    } finally {
      setIsProcessingImage(false);
      input.value = null;
    }
  };

  /* ===================== حفظ ===================== */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCar) return;

    if (documents.length >= MAX_DOCS_PER_CAR) {
      return showToast(t('maxDocumentsReached'), 'error');
    }

    const isBlank = (v) => v === '' || v === undefined || v === null;
    if (isBlank(formData.endDate) || isBlank(formData.type)) {
      return showToast(t('fillRequiredFields'), 'error');
    }

    if (!VALID_TYPES.includes(formData.type)) {
      return showToast(t('errorSaving'), 'error');
    }

    // ✅ التحقق الرياضي من التاريخ
    const parsed = new Date(formData.endDate + 'T00:00:00');
    if (isNaN(parsed.getTime())) {
      return showToast(t('invalidDate'), 'error');
    }

    try {
      const newRecord = dbService.addDocument({ 
        carId: currentCar.id, 
        type: formData.type, 
        endDate: formData.endDate,
        image: formData.image
      });

      if (newRecord) {
        setShowForm(false);
        setFormData(EMPTY_FORM);
        loadData();
        bumpDataVersion(); 
        showToast(t('saveSuccess'), 'success');
      }
    } catch (error) {
      console.error("خطأ في حفظ الوثيقة:", error);
      const isQuota = error?.name === 'QuotaExceededError' || String(error).includes('quota');
      showToast(
        isQuota ? t('storageFull') : t('errorSaving'),
        'error'
      );
    }
  };

  /* ===================== حذف ===================== */
  const handleDelete = () => {
    if (!deleteId) return;
    try {
      dbService.deleteDocument(deleteId);
      bumpDataVersion();
      setDeleteId(null);
      loadData();
    } catch (e) {
      console.error('deleteDocument failed:', e);
      setDeleteId(null);
      showToast(t('errorSaving'), 'error');
    }
  };

  /* ===================== حساب الحالة (Math & Logic) ===================== */
  const getStatus = useCallback((endDate) => {
    if (!endDate) {
      return { label: '—', color: 'text-slate-400', bg: 'bg-slate-800', icon: FileText };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate + 'T00:00:00');
    end.setHours(0, 0, 0, 0);

    if (isNaN(end.getTime())) {
      return { label: '—', color: 'text-slate-400', bg: 'bg-slate-800', icon: FileText };
    }

    // ✅ تطبيع كلا الطرفين لمنتصف الليل يمنع أخطاء التوقيت
    const diffDays = Math.round((end - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: t('expired'), color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
    }
    if (diffDays === 0) {
      return { label: t('expiresToday'), color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
    }
    if (diffDays <= 30) {
      return {
        label: `${t('expiringSoon')} (${diffDays} ${t('days')})`,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        icon: AlertTriangle
      };
    }
    return { label: t('valid'), color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle };
  }, [t]);

  const deleteMessage = useMemo(() => {
    const msg = t('confirmDeleteMsg');
    return msg === 'confirmDeleteMsg' 
      ? 'هل أنت متأكد من حذف هذه الوثيقة؟ لا يمكن التراجع.' 
      : msg;
  }, [t]);

  return (
    <div className="space-y-4 pb-24 px-4 min-h-screen">
      
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
          <span className="text-sm font-bold">{toast.message}</span>
          <button 
            type="button"
            onClick={dismissToast} 
            aria-label={t('close')}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('documents')}</h1>
        <button 
          type="button"
          onClick={() => setShowForm(!showForm)} 
          aria-label={showForm ? t('cancel') : t('addDocument')}
          className={`p-3 rounded-full text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--primary)] hover:bg-blue-600'}`}
        >
          {showForm ? <X size={24} aria-hidden="true" /> : <Plus size={24} aria-hidden="true" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] space-y-4 shadow-lg animate-fade-in mb-6">
          <div>
            <label htmlFor="docType" className="text-xs text-[var(--text-muted)] mb-1 block">{t('documentType')}</label>
            <select 
              id="docType"
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})} 
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]"
            >
              <option value="insurance">{t('insurance')}</option>
              <option value="technicalInspection">{t('technicalInspection')}</option>
              <option value="license">{t('license')}</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="docEndDate" className="text-xs text-[var(--text-muted)] mb-1 block">{t('endDate')}</label>
            <input 
              id="docEndDate"
              type="date" 
              value={formData.endDate} 
              onChange={e => setFormData({...formData, endDate: e.target.value})} 
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" 
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">
              {t('documentImage')} ({t('optional')})
            </label>
            <label className={`flex flex-col items-center justify-center w-full h-32 bg-[var(--surface-2)] border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--surface)] hover:border-[var(--primary)]/50 transition-colors overflow-hidden relative ${isProcessingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              {formData.image ? (
                <>
                  <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">{t('changeImage')}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-[var(--text-muted)]">
                  <Camera size={28} className="mb-2" aria-hidden="true" />
                  <span className="text-xs font-bold">
                    {isProcessingImage 
                      ? t('processing') 
                      : t('tapToAddImage')}
                  </span>
                  <span className="text-[10px] opacity-60 mt-1">JPEG/PNG · Max 1.5MB</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={isProcessingImage}
              />
            </label>
          </div>

          <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">
            {t('saveDocument')}
          </button>
        </form>
      )}

      {documents.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <FileText size={48} className="opacity-40" aria-hidden="true" />
          </div>
          <p>{t('noDocuments')}</p>
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
                      <img src={doc.image} alt={t(doc.type)} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bg} ${status.color}`}>
                      <StatusIcon size={24} aria-hidden="true" />
                    </div>
                  )}
                  
                  <div>
                    <p className="font-bold text-[var(--text)] text-base">{t(doc.type)}</p>
                    <p className={`text-[11px] font-bold mt-0.5 ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[10px] text-[var(--text-muted)] font-medium text-end">
                    {t('endsOn')}: <br/>
                    <span className="font-bold text-[var(--text)] bg-[var(--surface-2)] px-2 py-0.5 rounded inline-block mt-0.5">
                      {/* ✅ 5. استخدام formatDate الموحدة */}
                      {formatDate(doc.endDate, todayLocale)}
                    </span>
                  </p>
                  <button 
                    type="button"
                    onClick={() => setDeleteId(doc.id)} 
                    aria-label={t('confirmDelete')}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"
                  >
                    <Trash2 size={16} aria-hidden="true" />
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
        title={t('confirmDelete')}
        message={deleteMessage}
        variant="danger"
        confirmText={t('confirmDeleteBtn')}
      />
    </div>
  );
}
