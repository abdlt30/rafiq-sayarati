import { forwardRef } from 'react';

/* ✅ خريطة الأنواع (Variants) - أسرع وأسهل للتوسيع */
const VARIANTS = {
  primary: 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 hover:opacity-90',
  ghost: 'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-2)]',
  danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  success: 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600',
  outline: 'bg-transparent text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary)]/10',
};

const Button = forwardRef(function Button(
  { 
    children, 
    variant = 'primary', 
    type = 'button', // ✅ إصلاح حرج: الافتراضي هو button وليس submit
    className = '', 
    disabled,
    ...props 
  }, 
  ref
) {
  // ✅ التنسيقات الأساسية + مؤشر التركيز (Focus Ring) لـ A11y
  const baseStyle = "w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:scale-[0.98]";
  
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button 
      ref={ref}
      type={type}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
});

// ✅ إضافة اسم للمكون لتسهيل تصحيح الأخطاء في React DevTools
Button.displayName = 'Button';

export default Button;
