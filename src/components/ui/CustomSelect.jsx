import { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext'; // ✅ استدعاء الـ Context
import { Search, Check, ChevronDown, X } from 'lucide-react';

export default function CurrencySelector({ currentCurrency, onSelect }) {
  const { t, lang } = useContext(AppContext); // ✅ جلب الترجمة واللغة الحالية
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // قائمة العملات (بدون أسماء، الأسماء تأتي من الترجمة)
  const currencies = [
    { code: 'MAD', symbol: 'MAD', regionKey: 'northAfrica' },
    { code: 'SAR', symbol: 'SAR', regionKey: 'gulf' },
    { code: 'AED', symbol: 'AED', regionKey: 'gulf' },
    { code: 'EGP', symbol: 'EGP', regionKey: 'northAfrica' },
    { code: 'QAR', symbol: 'QAR', regionKey: 'gulf' },
    { code: 'KWD', symbol: 'KWD', regionKey: 'gulf' },
    { code: 'BHD', symbol: 'BHD', regionKey: 'gulf' },
    { code: 'OMR', symbol: 'OMR', regionKey: 'gulf' },
    { code: 'JOD', symbol: 'JOD', regionKey: 'fertileCrescent' },
    { code: 'DZD', symbol: 'DZD', regionKey: 'northAfrica' },
    { code: 'TND', symbol: 'TND', regionKey: 'northAfrica' },
    { code: 'LYD', symbol: 'LYD', regionKey: 'northAfrica' },
    { code: 'USD', symbol: 'USD', regionKey: 'global' },
    { code: 'EUR', symbol: 'EUR', regionKey: 'global' },
  ];

  // دالة مساعدة لترجمة المناطق
  const getRegionName = (key) => {
    const regions = {
      northAfrica: { ar: 'شمال أفريقيا', en: 'North Africa', fr: 'Afrique du Nord' },
      gulf: { ar: 'الخليج', en: 'Gulf', fr: 'Golfe' },
      fertileCrescent: { ar: 'الهلال الخصيب', en: 'Fertile Crescent', fr: 'Croissant Fertile' },
      global: { ar: 'عالمية', en: 'Global', fr: 'Mondial' }
    };
    return regions[key]?.[lang] || regions[key]?.['en'] || key;
  };

  // فلترة العملات بناءً على البحث (يبحث بالاسم المترجم أو الرمز)
  const filteredCurrencies = currencies.filter(c => {
    const translatedName = t(`currency_${c.code}`).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return translatedName.includes(searchLower) || c.code.toLowerCase().includes(searchLower);
  });

  const activeCurrency = currencies.find(c => c.code === currentCurrency) || currencies[0];

  return (
    <>
      {/* الزر المضغوط */}
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text)] font-bold flex justify-between items-center hover:border-[var(--primary)] transition-colors text-sm"
      >
        <span>{t(`currency_${activeCurrency.code}`)} ({activeCurrency.symbol})</span>
        <ChevronDown size={16} className="text-[var(--text-muted)]" />
      </button>

      {/* النافذة السفلية المخصصة */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-[var(--surface)] w-full max-w-md mx-auto rounded-t-3xl border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[80vh]">
            
            {/* رأس النافذة */}
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-bold text-base text-[var(--text)]">{t('selectCurrency') || 'اختر العملة'}</h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>

            {/* شريط البحث */}
            <div className="p-3 pb-1">
              <div className="relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  placeholder={t('searchCurrency') || 'ابحث...'} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg py-2 pr-9 pl-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            {/* قائمة العملات */}
            <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
              {filteredCurrencies.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] text-sm py-4">{t('noResults') || 'لا توجد نتائج'}</p>
              ) : (
                filteredCurrencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { onSelect(c.code); setIsOpen(false); setSearchTerm(''); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      currentCurrency === c.code 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                        : 'border-transparent hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="text-start">
                      <p className="font-bold text-sm text-[var(--text)]">{t(`currency_${c.code}`)}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{getRegionName(c.regionKey)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--text-muted)]">{c.symbol}</span>
                      {currentCurrency === c.code && <Check size={16} className="text-[var(--primary)]" />}
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
