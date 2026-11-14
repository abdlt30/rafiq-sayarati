import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { dbService } from '../services/dbService.js';
import { Plus, Trash2, X, FileText, Camera, AlertCircle, CheckCircle, Download } from 'lucide-react';

import OptionPicker from '../shared/components/ui/OptionPicker.jsx';
import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx';
import { formatDate } from '../shared/utils/formatters.js';

const EMPTY_FORM = { type: 'insurance', date: '', image: '' };
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIM = 800;

export default function Documents() {
  const { currentCar, t, lang, dataVersion, bumpDataVersion } = useContext(AppContext); 
  
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const todayLocale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const docTypes = [
    { value: 'insurance', label: t('insurance') || 'تأمين' },
    { value: 'registration', label: t('registration') || 'رخصة (Carte Grise)' },
    { value: 'license', label: t('license') || 'رخصة السياقة' },
    { value: 'inspection', label: t('inspection') || 'فحص تقني' },
    { value: 'other', label: t('other') || 'أخرى' }
  ];

  const showToast = useCallback((message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!currentCar) return;
      const allDocs = await dbService.getDocuments();
      const carDocs = (allDocs || []).filter(r => String(r.carId) === String(currentCar.id));
      setRecords([...carDocs].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    } catch (e) { console.error(e); setRecords([]); } finally { setIsLoading(false); }
  }, [currentCar]);

  useEffect(() => { loadData(); }, [loadData, dataVersion]);

  const compressImage = (file, maxDim = MAX_IMAGE_DIM) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read_failed'));
      reader.onload = (event) => {
        const img = new Image();
        img.onerror = () => reject(new Error('image_load_failed'));
        img.onload = () => {
          try {
            let w = img.width; let h = img.height;
            if (w > maxDim || h > maxDim) { if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; } else { w = Math.round((w * maxDim) / h); h = maxDim; } }
            const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d'); if (!ctx) return reject(new Error('canvas_failed'));
            ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/jpeg', 0.6));
          } catch (err) { reject(err); }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) return showToast(t('invalidFileType'), 'error');
    if (file.size > MAX_IMAGE_SIZE) return showToast(t('imageTooLarge'), 'error');
    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({ ...prev, image: compressed })); e.target.value = null;
    } catch (err) { showToast(t('imageProcessingFailed'), 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCar) return;
    if (!formData.image) return showToast(t('imageRequired') || 'الرجاء رفع صورة الوثيقة', 'error');
    try {
      await dbService.addDocument({ carId: currentCar.id, type: formData.type, date: formData.date || null, image: formData.image });
      await loadData(); bumpDataVersion(); setIsModalOpen(false); setFormData(EMPTY_FORM); showToast(t('saveSuccess'), 'success');
    } catch (error) { showToast(t('errorSaving'), 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await dbService.deleteDocument(deleteId); await loadData(); bumpDataVersion(); setDeleteId(null); } catch (e) { showToast(t('errorSaving'), 'error'); setDeleteId(null); }
  };

  const getTypeLabel = (type) => docTypes.find(d => d.value === type)?.label || type;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-[var(--surface-2)] rounded-lg w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-40 bg-[var(--surface-2)] rounded-2xl"></div>
          <div className="h-40 bg-[var(--surface-2)] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-2 opacity-70"><X size={16} /></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('documents')}</h1>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 p-6 text-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <FileText size={36} className="text-green-500" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">{t('secureDocuments') || 'وثائقك في أمان'}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">{t('noDocuments')} احفظ صور التأمين والرخصة لتكون دائماً في أمان قانوني.</p>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-white bg-[var(--primary)] px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 shadow-lg">
            <Plus size={18} /> {t('addDocument')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-green-500/30 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0"><FileText size={16} /></div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-sm">{getTypeLabel(record.type)}</p>
                    {record.date && <p className="text-[10px] text-[var(--text-muted)]">{formatDate(record.date, todayLocale)}</p>}
                  </div>
                </div>
                <button onClick={() => setDeleteId(record.id)} className="text-red-500 p-1.5 bg-red-500/10 rounded-lg active:scale-90"><Trash2 size={16} /></button>
              </div>
              <div className="relative w-full h-32 bg-[var(--surface-2)] rounded-xl overflow-hidden border border-[var(--border)] group">
                <img src={record.image} alt="doc" className="w-full h-full object-cover" />
                <a href={record.image} download={`document_${record.id}.jpg`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-sm">
                  <Download size={24} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={() => { setIsModalOpen(true); setFormData(EMPTY_FORM); }} className="fixed bottom-24 right-6 rtl:left-6 w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center z-40 active:scale-95 transition-transform"><Plus size={28} /></button>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={t('confirmDelete')} message={t('confirmDeleteMsg')} variant="danger" confirmText={t('confirmDeleteBtn')} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative shadow-2xl">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 left-4 rtl:right-4 p-1.5 bg-[var(--surface-2)] rounded-full z-10"><X size={20} /></button>
            <h2 className="text-lg font-bold text-center mb-5 mt-1">{t('addDocument')}</h2>
            <div className="space-y-4">
              <OptionPicker label={t('documentType')} options={docTypes} value={formData.type} onChange={(val) => setFormData(prev => ({ ...prev, type: val }))} />
              <div><label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">{t('expiryDate')}</label><input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm [color-scheme:dark]" /></div>
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">{t('documentImage')}</label>
                <div className="relative w-full h-40 rounded-xl bg-[var(--surface-2)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden group hover:border-green-500 transition-colors">
                  {formData.image ? (
                    <><img src={formData.image} alt="doc" className="w-full h-full object-contain" /><button type="button" onClick={() => setFormData(prev => ({...prev, image: ''}))} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full"><X size={14} /></button></>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-[var(--text-muted)] group-hover:text-green-500 transition-colors">
                      <Camera size={32} className="mb-2" /><span className="text-xs font-bold">{t('uploadImage')}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <button type="submit" className="w-full mt-5 bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95">{t('save')}</button>
          </form>
        </div>
      )}
    </div>
  );
}
