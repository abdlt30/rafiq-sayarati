import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1 w-full mb-4 relative">
      {label && <label className="text-xs text-slate-400">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white flex justify-between items-center focus:outline-none focus:border-brand-500"
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="px-4 py-3 text-sm text-slate-300 hover:bg-dark-700 hover:text-white cursor-pointer"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
