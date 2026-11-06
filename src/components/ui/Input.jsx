export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full mb-4">
      {/* 1. استخدام متغير لون النص الثانوي */}
      {label && (
        <label className="text-xs font-medium text-[var(--text-muted)]">
          {label}
        </label>
      )}
      
      {/* 2. استخدام متغيرات الخلفية، الإطار، والنص الأساسي */}
      <input 
        className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
        {...props} 
      />
    </div>
  );
}
