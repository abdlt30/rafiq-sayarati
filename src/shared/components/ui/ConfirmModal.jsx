import { useContext, useEffect, useId } from 'react';
import { AppContext } from '../../context/AppContext';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText,
  cancelText,
  variant = 'danger'
}) {
  const { t } = useContext(AppContext);
  
  // ✅ إنشاء معرفات فريدة لربط العنوان والوصف بقارئ الشاشة
  const titleId = useId();
  const descId = useId();

  // ✅ إدارة تمرير الصفحة + الاستماع لزر Escape
  useEffect(() => {
    if (!isOpen) return;

    // حفظ قيمة overflow القديمة
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // الاستماع لزر Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // التنظيف
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const Icon = isDanger ? AlertTriangle : CheckCircle2;
  const iconBg = isDanger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500';
  const btnBg = isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-[var(--primary)] hover:bg-blue-600 shadow-blue-500/30';

  const handleBackdropClick = (e) => {
    // ✅ التأكد من أن النقر كان على الخلفية نفسها وليس على المحتوى
    if (e.target === e.currentTarget) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      // ✅ دلالات الوصول (A11y)
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div 
        className="bg-[var(--surface)] w-full max-w-sm rounded-3xl p-6 border border-[var(--border)] shadow-2xl text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
          <Icon size={32} />
        </div>
        
        <h2 id={titleId} className="text-xl font-bold text-[var(--text)] mb-2">
          {title || (isDanger ? (t('confirmDelete') || 'تأكيد الحذف') : (t('confirmAction') || 'تأكيد الإجراء'))}
        </h2>
        
        <p id={descId} className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          {message || (t('confirmMsgDefault') || 'هل أنت متأكد من هذا الإجراء؟')}
        </p>
        
        <div className="flex gap-3">
          {/* ✅ إضافة type="button" لمنع إرسال النماذج */}
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-3.5 bg-[var(--surface-2)] text-[var(--text)] font-bold rounded-xl hover:bg-[var(--border)] active:scale-95 transition-all"
          >
            {cancelText || t('cancel') || 'إلغاء'}
          </button>
          
          <button 
            type="button"
            onClick={onConfirm} 
            className={`flex-1 py-3.5 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 active:scale-95 ${btnBg}`}
          >
            {isDanger && <Trash2 size={18} />}
            {confirmText || (isDanger ? (t('delete') || 'حذف') : (t('confirm') || 'تأكيد'))}
          </button>
        </div>
      </div>
    </div>
  );
}
