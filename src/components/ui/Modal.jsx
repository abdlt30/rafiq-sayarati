export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-dark-700 p-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold text-white mb-4 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
}
