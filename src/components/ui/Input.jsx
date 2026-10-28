export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full mb-4">
      {label && <label className="text-xs text-slate-400">{label}</label>}
      <input 
        className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
        {...props} 
      />
    </div>
  );
}
