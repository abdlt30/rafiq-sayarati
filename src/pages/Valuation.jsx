import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Tag, TrendingDown, Calculator, Info, Gauge } from 'lucide-react';

export default function Valuation() {
  const { currentCar, t, currency } = useContext(AppContext);
  
  // حالة النموذج
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseYear, setPurchaseYear] = useState('');
  const [condition, setCondition] = useState('good'); // excellent, good, fair
  const [showResult, setShowResult] = useState(false);

  // حساب القيمة
  const calculateValuation = useMemo(() => {
    if (!purchasePrice || !purchaseYear || !currentCar) return null;

    const price = Number(purchasePrice);
    const year = Number(purchaseYear);
    const currentYear = new Date().getFullYear();
    
    // 1. حساب العمر
    let age = currentYear - year;
    if (age < 0) age = 0;

    // 2. نسبة الاستهلاك السنوي (10% لكل سنة)
    const ageDepreciation = age * 0.10; 
    
    // 3. استهلاك المسافة (1% لكل 10,000 كم)
    const mileage = Number(currentCar.odometer) || 0;
    const mileageDepreciation = (mileage / 10000) * 0.01;

    // 4. معامل الحالة
    const conditionMultiplier = condition === 'excellent' ? 1.05 : condition === 'fair' ? 0.90 : 1.0;

    // المعادلة النهائية
    let estimatedValue = price * (1 - ageDepreciation - mileageDepreciation) * conditionMultiplier;

    // يجب ألا تقل القيمة عن 10% من السعر الأصلي
    if (estimatedValue < (price * 0.10)) {
      estimatedValue = price * 0.10;
    }

    return Math.round(estimatedValue);
  }, [purchasePrice, purchaseYear, condition, currentCar]);

  const handleCalculate = (e) => {
    e.preventDefault();
    setShowResult(true);
  };

  return (
    <div className="space-y-4 pb-24 px-4 min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('valuation') || 'تقييم السيارة'}</h1>
      </div>

      {/* مقدمة */}
      <div className="bg-[var(--surface-2)] p-4 rounded-2xl flex items-start gap-3 border border-[var(--border)]">
        <Info className="text-blue-500 flex-shrink-0" size={20} />
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          أدخل بيانات السيارة لحساب القيمة السوقية التقديرية بناءً على معادلة الاستهلاك (العمر، المسافة، الحالة).
        </p>
      </div>

      {/* النموذج */}
      <form onSubmit={handleCalculate} className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] space-y-4 shadow-sm">
        
        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">سعر الشراء الأصلي ({currency})</label>
          <input 
            type="number" 
            required 
            placeholder="مثال: 15000" 
            value={purchasePrice} 
            onChange={e => {setPurchasePrice(e.target.value); setShowResult(false);}} 
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">سنة الصنع / الشراء</label>
          <input 
            type="number" 
            required 
            placeholder="مثال: 2020" 
            min="1990" max={new Date().getFullYear()}
            value={purchaseYear} 
            onChange={e => {setPurchaseYear(e.target.value); setShowResult(false);}} 
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" 
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] mb-1 block">حالة السيارة الحالية</label>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => {setCondition('excellent'); setShowResult(false);}} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${condition === 'excellent' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>ممتازة</button>
            <button type="button" onClick={() => {setCondition('good'); setShowResult(false);}} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${condition === 'good' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>جيدة</button>
            <button type="button" onClick={() => {setCondition('fair'); setShowResult(false);}} className={`p-3 rounded-xl border text-sm font-bold transition-colors ${condition === 'fair' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>تحتاج صيانة</button>
          </div>
        </div>

        <button type="submit" className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Calculator size={20} />
          حساب القيمة التقديرية
        </button>
      </form>

      {/* نتيجة التقييم */}
      {showResult && calculateValuation && (
        <div className="mt-6 animate-fade-in">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl text-center relative overflow-hidden">
            {/* خلفية جمالية */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Tag size={100} />
            </div>
            
            <h3 className="text-blue-100 text-sm font-bold mb-2">القيمة السوقية التقديرية</h3>
            <div className="flex items-center justify-center gap-2">
              <p className="text-5xl font-black text-white">{calculateValuation.toLocaleString()}</p>
              <p className="text-lg font-bold text-blue-200 mt-2">{currency}</p>
            </div>
            
            <div className="mt-6 bg-black/20 rounded-xl p-3 inline-flex items-center gap-2 text-xs text-white/80">
              <TrendingDown size={16} className="text-red-400" />
              <span>انخفاض عن السعر الأصلي: {Math.round(((purchasePrice - calculateValuation) / purchasePrice) * 100)}%</span>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">
            * هذه القيمة تقديرية بناءً على خوارزمية الاستهلاك المحلية ولا تغني عن فحص السوق الفعلي.
          </p>
        </div>
      )}

    </div>
  );
}
