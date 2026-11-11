import { useState, useContext, useEffect, useId } from 'react';
import { AppContext } from '../../context/AppContext';
import { Check, ChevronDown, X } from 'lucide-react';

export default function OptionPicker({ label, options = [], value, onChange }) {
  const { t } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  // ✅ اختيار آمن مع حماية من القائمة الفارغة
  const selectedOption = options.find(o => o.value === value) || options[0] || null;

  // ✅ قفل التمرير + دعم زر Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">
          {label}
        </label>
      )}
      
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        // ✅ دلالات الوصول
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label || t('selectOption')}
        className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] font-medium flex justify-between items-center text-start active:scale-[0.99] transition-transform"
      >
        <span className="truncate pe-2">
          {selectedOption ? selectedOption.label : (t('noOptions') || 'لا توجد خيارات')}
        </span>
        <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0" />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[150] flex flex-col justify-end backdrop-blur-sm animate-fade-in"
          onClick={handleBackdropClick}
          // ✅ دلالات الوصول
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div 
            className="bg-[var(--surface)] w-full max-w-md mx-auto rounded-t-3xl border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 id={titleId} className="font-bold text-base text-[var(--text)]">
                {label || t('selectOption')}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                aria-label={t('close') || 'إغلاق'}
                className="p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] active:scale-90 transition-transform"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-3 space-y-1.5 flex-1" role="listbox">
              {options.length === 0 ? (
                <p className="text-center text-sm text-[var(--text-muted)] py-6">
                  {t('noOptions') || 'لا توجد خيارات متاحة.'}
                </p>
              ) : (
                options.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={value === o.value}
                    onClick={() => { onChange(o.value); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      value === o.value 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' 
                        : 'border-transparent hover:bg-[var(--surface-2)] text-[var(--text)]'
                    }`}
                  >
                    <span className="font-bold text-sm text-start pe-2">{o.label}</span>
                    {value === o.value && <Check size={16} className="flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
