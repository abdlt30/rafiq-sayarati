export default function Button({ children, variant = 'primary', className = '', ...props }) {
  // 1. التنسيقات الأساسية لجميع الأزرار
  const baseStyle = "w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // 2. تنسيقات الأنواع المختلفة (Variants) بناءً على متغيرات التطبيق
  let variantStyle = '';
  
  if (variant === 'primary') {
    variantStyle = 'bg-[var(--primary)] text-white shadow-lg hover:opacity-90 active:scale-[0.98]';
  } 
  else if (variant === 'ghost') {
    variantStyle = 'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-2)] active:scale-[0.98]';
  } 
  else if (variant === 'danger') {
    variantStyle = 'bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-[0.98]';
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
