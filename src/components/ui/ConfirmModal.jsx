import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  const { t } = useContext(AppContext); // ✅ جلب دالة الترجمة

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] w-full max-w-sm rounded-3xl p-6 border border-[var(--border)] shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">{title || t('confirmDelete') || 'تأكيد الحذف'}</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">{message}</p>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 bg-[var(--surface-2)] text-[var(--text)] font-bold rounded-xl hover:bg-[var(--border)] transition-colors">
            {t('cancel') || 'إلغاء'}
          </button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
            {t('delete') || 'حذف'}
          </button>
        </div>
      </div>
    </div>
  );
}
