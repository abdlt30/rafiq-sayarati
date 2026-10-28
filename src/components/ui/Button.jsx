export default function Button({ children, className = '', ...props }) {
  return (
    <button 
      className={`w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-brand-500/30 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
