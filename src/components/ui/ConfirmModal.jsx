import Button from './Button';

export default function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 w-full max-w-sm rounded-2xl border border-dark-700 p-6 shadow-2xl text-center">
        <p className="text-white text-lg mb-6">{message}</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-slate-400 bg-dark-700 hover:bg-dark-600">إلغاء</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl text-white bg-red-500 hover:bg-red-600">حذف</button>
        </div>
      </div>
    </div>
  );
}
