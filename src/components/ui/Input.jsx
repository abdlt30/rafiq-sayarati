import { useId, forwardRef } from 'react';

const Input = forwardRef(function Input(
  { 
    label, 
    error, 
    helper, 
    id: customId, 
    required, 
    disabled,
    className = '', 
    ...props 
  },
  ref
) {
  // ✅ توليد id فريد تلقائياً لربط label بالحقل
  const autoId = useId();
  const inputId = customId || autoId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  // ✅ ربط رسائل الخطأ/المساعدة للحقل عبر aria-describedby
  const describedBy = [
    error ? errorId : null,
    helper && !error ? helperId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full mb-4">
      
      {/* التسمية - مرتبطة بالحقل عبر htmlFor */}
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--text-muted)]"
        >
          {label}
          {required && (
            <span className="text-red-500 ms-1" aria-hidden="true">*</span>
          )}
        </label>
      )}
      
      {/* حقل الإدخال */}
      <input 
        ref={ref}
        id={inputId}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`w-full bg-[var(--surface-2)] border rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
        } ${className}`}
        {...props} 
      />

      {/* رسالة الخطأ (تظهر فوراً وتُعلَن لقارئ الشاشة) */}
      {error && (
        <p 
          id={errorId} 
          role="alert" 
          className="text-xs text-red-500 font-medium animate-fade-in"
        >
          {error}
        </p>
      )}

      {/* نص المساعدة (اختياري) */}
      {helper && !error && (
        <p 
          id={helperId} 
          className="text-xs text-[var(--text-muted)]"
        >
          {helper}
        </p>
      )}
    </div>
  );
});

export default Input;
