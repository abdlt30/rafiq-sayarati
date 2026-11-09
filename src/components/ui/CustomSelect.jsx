import { useState } from 'react';
import { Search, Check, ChevronDown, X } from 'lucide-react';

export default function CurrencySelector({ currentCurrency, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currencies = [
    { code: 'MAD', name: 'درهم مغربي', symbol: 'MAD', region: 'شمال أفريقيا' },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'SAR', region: 'الخليج' },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'AED', region: 'الخليج' },
    { code: 'EGP', name: 'جنيه مصري', symbol: 'EGP', region: 'شمال أفريقيا' },
    { code: 'QAR', name: 'ريال قطري', symbol: 'QAR', region: 'الخليج' },
    { code: 'KWD', name: 'دينار كويتي', symbol: 'KWD', region: 'الخليج' },
    { code: 'BHD', name: 'دينار بحريني', symbol: 'BHD', region: 'الخليج' },
    { code: 'OMR', name: 'ريال عماني', symbol: 'OMR', region: 'الخليج' },
    { code: 'JOD', name: 'دينار أردني', symbol: 'JOD', region: 'الهلال الخصيب' },
    { code: 'DZD', name: 'دينار جزائري', symbol: 'DZD', region: 'شمال أفريقيا' },
    { code: 'TND', name: 'دينار تونسي', symbol: 'TND', region: 'شمال أفريقيا' },
    { code: 'LYD', name: 'دينار ليبي', symbol: 'LYD', region: 'شمال أفريقيا' },
    { code: 'USD', name: 'دولار أمريكي', symbol: 'USD', region: 'عالمية' },
    { code: 'EUR', name: 'يورو', symbol: 'EUR', region: 'عالمية' },
  ];

  const filteredCurrencies = currencies.filter(c => 
    c.name.includes(searchTerm) || c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCurrency = currencies.find(c => c.code === currentCurrency) || currencies[0];

  return (
    <>
      {/* الزر الذي يفتح القائمة */}
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 text-[var(--text)] font-bold flex justify-between items-center hover:border-[var(--primary)] transition-colors"
      >
        <span>{activeCurrency.name} ({activeCurrency.symbol})</span>
        <ChevronDown size={18} className="text-[var(--text-muted)]" />
      </button>

      {/* النافذة السفلية المخصصة */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-[var(--surface)] w-full max-w-md mx-auto rounded-t-3xl border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[85vh]">
            
            {/* رأس النافذة */}
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[var(--text)]">اختر العملة</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            {/* شريط البحث */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  placeholder="ابحث عن عملة..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2.5 pr-10 pl-4 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            {/* قائمة العملات */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {filteredCurrencies.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] text-sm py-4">لا توجد نتائج</p>
              ) : (
                filteredCurrencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { onSelect(c.code); setIsOpen(false); setSearchTerm(''); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      currentCurrency === c.code 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                        : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="text-start">
                      <p className="font-bold text-sm text-[var(--text)]">{c.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.region}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-[var(--text-muted)]">{c.symbol}</span>
                      {currentCurrency === c.code && <Check size={18} className="text-[var(--primary)]" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
