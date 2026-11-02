export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-4 shadow-lg hover:border-brand-500/30 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
