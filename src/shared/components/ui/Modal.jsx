import { useEffect, useId } from 'react';
import { X } from 'lucide-react';

// ✅ إضافة closeLabel كـ prop مع قيمة افتراضية لدعم الترجمة
export default function Modal({ isOpen, onClose, title, children, closeLabel = 'إغلاق' }) {
  const titleId = useId();

  // ✅ إدارة دورة حياة المودال (قفل التمرير + زر Escape)
  useEffect(() => {
    if (!isOpen) return;

    // 1. قفل تمرير الخلفية
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 2. الاستماع لزر Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // 3. تنظيف عند الإغلاق
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ✅ إغلاق عند النقر على الخلفية فقط (وليس المحتوى)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      // ✅ رفع z-index إلى 100 لضمان ظهوره فوق الشريط السفلي (BottomNav)
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      // ✅ دلالات الوصول (A11y)
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div 
        className="bg-[var(--surface)] w-full max-w-md rounded-2xl border border-[var(--border)] p-5 shadow-2xl relative animate-scale-in"
        onClick={(e) => e.stopPropagation()} // منع إغلاق المودال عند النقر بداخله
        role="document"
      >
        {/* زر الإغلاق */}
        <button 
          type="button" 
          onClick={onClose} 
          aria-label={closeLabel}
          className="absolute top-4 start-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-[var(--text)] active:scale-90 transition-all"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* العنوان */}
        {title && (
          <h2 
            id={titleId} 
            className="text-xl font-bold text-[var(--text)] mb-4 text-center mt-2"
          >
            {title}
          </h2>
        )}
        
        {/* محتوى المودال */}
        <div className="overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
