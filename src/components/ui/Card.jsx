export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-dark-800 rounded-2xl border border-dark-700 p-4 shadow-lg ${className}`}>
      {children}
    </div>
  );
}
