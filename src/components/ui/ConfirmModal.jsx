import { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText, // ✅ نص مخصص لزر التأكيد
  cancelText,  // ✅ نص مخصص لزر الإلغاء
  variant = 'danger' // ✅ نوع النافذة: 'danger' (حذف) أو 'primary' (تأكيد عادي)
}) {
  const { t } = useContext(AppContext);

  // ✅ منع تمرير الخلفية عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // إعدادات الألوان والأيقونات بناءً على نوع النافذة
  const isDanger = variant === 'danger';
  const Icon = isDanger ? AlertTriangle : CheckCircle2;
  const iconBg = isDanger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500';
  const btnBg = isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-[var(--primary)] hover:bg-blue-600 shadow-blue-500/30';

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose} // ✅ الإغلاق عند النقر على الخلفية
    >
      {/* منع إغلاق النافذة عند النقر بداخلها */}
      <div 
        className="bg-[var(--surface)] w-full max-w-sm rounded-3xl p-6 border border-[var(--border)] shadow-2xl text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
          <Icon size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">
          {title || (isDanger ? t('confirmDelete') || 'تأكيد الحذف' : 'تأكيد الإجراء')}
        </h2>
        
        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          {message || 'هل أنت متأكد من هذا الإجراء؟'}
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3.5 bg-[var(--surface-2)] text-[var(--text)] font-bold rounded-xl hover:bg-[var(--border)] transition-colors"
          >
            {cancelText || t('cancel') || 'إلغاء'}
          </button>
          
          <button 
            onClick={onConfirm} 
            className={`flex-1 py-3.5 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 ${btnBg}`}
          >
            {isDanger && <Trash2 size={18} />}
            {confirmText || (isDanger ? t('delete') || 'حذف' : t('confirm') || 'تأكيد')}
          </button>
        </div>
      </div>
    </div>
  );
}
