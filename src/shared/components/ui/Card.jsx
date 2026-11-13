// ✅ إضافة ...props لتمرير أي خصائص إضافية (مثل onClick أو id)
export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      // ✅ دمج كلاس card مع كلاسات Tailwind الافتراضية لضمان التصميم
      className={`card bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
