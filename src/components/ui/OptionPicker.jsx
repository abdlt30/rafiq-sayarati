import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

export default function OptionPicker({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="w-full">
      {label && <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">{label}</label>}
      
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] font-medium flex justify-between items-center text-start"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={16} className="text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-[var(--surface)] w-full max-w-md mx-auto rounded-t-3xl border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text)]">اختر {label}</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
              {options.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    value === o.value ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' : 'border-transparent hover:bg-[var(--surface-2)] text-[var(--text)]'
                  }`}
                >
                  <span className="font-bold text-sm">{o.label}</span>
                  {value === o.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
